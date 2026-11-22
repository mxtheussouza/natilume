# Natilume

Amigo Secreto de Natal com um link público por sala. O criador dá um nome à sala, informa os participantes e compartilha o link com a turma. Cada pessoa seleciona seu próprio nome e revela o destinatário uma única vez. O segundo endereço, administrativo e secreto, permite que o criador acompanhe o andamento.

## Executar localmente

Use Node.js 24 LTS (24.11 ou superior na série 24), npm e PostgreSQL 17. O Docker Compose sobe o PostgreSQL na porta local 56432 e inicializa também um banco separado para testes.

```sh
cp .env.example .env
docker compose up -d --wait
npm ci
npm run db:migrate
npm run dev
```

Abra [Natilume local](http://localhost:3000). O volume do Compose mantém as salas quando o contêiner para. Para usar um PostgreSQL existente, ajuste `DATABASE_URL` e dispense o Compose.

## Configuração

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão do servidor com o PostgreSQL. Também é usada nas migrações quando não há URL direta. |
| `APP_URL` | Origem usada para gerar os links. Obrigatória em produção. Em desenvolvimento, o padrão é `http://localhost:3000`. |
| `DIRECT_DATABASE_URL` | Conexão direta opcional, usada pelo Prisma CLI para aplicar migrações quando a aplicação usa um pooler. |
| `DATABASE_POOL_SIZE` | Número máximo de conexões PostgreSQL por processo Node. O padrão é 5. |
| `TEST_DATABASE_URL` | Conexão opcional para integração e E2E, passada no ambiente do processo. O padrão é o banco local `natilume_test` do Compose. Use um banco isolado. |

Guarde as credenciais em variáveis do ambiente ou no gerenciador de segredos da hospedagem. O arquivo `.env.example` usa credenciais exclusivas de desenvolvimento local.

## Testes

Com o banco local de teste em execução, use os comandos abaixo para migrar e verificar o projeto.

```sh
export TEST_DATABASE_URL=postgresql://natilume:local-only@127.0.0.1:56432/natilume_test
DIRECT_DATABASE_URL="$TEST_DATABASE_URL" npm run db:migrate
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install --only-shell chromium
npm run test:e2e
```

Em Linux, adicione `--with-deps` à instalação do navegador para instalar também as bibliotecas do sistema. A suíte E2E usa o build de produção na porta local 3035 e cria salas no banco de teste. `npm run test:unit` executa apenas testes que dispensam banco, e `npm run test:integration` testa as rotas com PostgreSQL real. O CI repete a suíte com PostgreSQL isolado. [Workflow de CI](.github/workflows/ci.yml)

### Verificação com leitor de tela

A suíte automatizada verifica semântica, contraste, ordem de foco, teclado e movimento reduzido. Para a verificação manual com VoiceOver ou NVDA, percorra o formulário pelos rótulos, confira o anúncio de validação, abra o diálogo, confirme a leitura de título e aviso de uso único, feche com Escape e confira o retorno de foco. Após confirmar, o foco deve ir para o título que contém a revelação. Confira também o anúncio ao copiar o link.

## Arquitetura e privacidade

- Next.js App Router, React e TypeScript estrito no servidor e na interface. Prisma e PostgreSQL persistem salas e participantes. As dependências exatas estão no lockfile.
- A criação gera a atribuição de todos os nomes via Fisher–Yates com aleatoriedade criptográfica, rejeição de autoatribuições e fallback cíclico. Sala e participantes são gravados em uma única transação. A FK autorreferencial é diferida até o commit, inclusive quando os dados são inseridos em lotes.
- A revelação faz um UPDATE condicional no PostgreSQL. O nome do destinatário aparece somente na resposta vencedora após o commit. A consulta pública fornece a lista de pendentes e a contagem. O painel só fornece nomes, status e totais.
- O endereço público usa 128 bits aleatórios e o administrativo usa um segredo independente de 192 bits, guardado como hash SHA-256. Quem tem o segredo pode abrir o painel. Guarde-o ao criar a sala, pois sua recuperação automática não é possível.
- Quem tem o link público pode selecionar qualquer nome ainda disponível. Peça a todos que escolham apenas o próprio nome. Mantenha a página aberta até aparecer o cartão e anote o resultado em privado. Se a resposta se perder depois do commit, atualize a lista para conferir o nome. A revelação já consumida permanece indisponível.
- Na V1, a lista e o sorteio são definitivos após a criação. Se precisar corrigir o grupo, crie uma nova sala. O banco impede exclusão acidental de salas com participantes e o painel não oferece cancelamento.

## Implantação em Node.js com PostgreSQL

1. Providencie um PostgreSQL 17 persistente e configure backups. Valide a restauração em uma instância separada. Para bancos gerenciados, use TLS com validação de certificado.
2. Configure `APP_URL` com a origem pública HTTPS e `DATABASE_URL` no ambiente da aplicação. Se houver pooler, configure `DIRECT_DATABASE_URL` no ambiente das migrações.
3. Execute `npm ci --include=dev` e `npm run build` no build. Execute `npm run db:migrate` uma vez no estágio de release, antes de disponibilizar a nova versão. Preserve a migração versionada no artefato de release.
4. Inicie com `npm run start`. Em um servidor próprio, termine HTTPS no proxy e encaminhe para a porta da aplicação, 3000 por padrão. Em hospedagem gerenciada, use o runtime Node do Next.js e rode a migração em um job separado da inicialização das réplicas.
5. Faça o teste de fumaça com dois nomes fictícios. Crie a sala, abra o link público em uma janela limpa, revele uma vez e confira o estado no painel. Confira o funcionamento do segundo participante até o encerramento. Nas rotas `/sala/*`, `/admin/*` e `/api/*`, mantenha o cache do proxy/CDN desativado e preserve `Cache-Control: no-store` e `Referrer-Policy: no-referrer`. Preserve também `X-Robots-Tag: noindex`.
6. Monitore latência, erros e saturação do pool com métricas agregadas e nomes de rota parametrizados. No proxy, CDN e APM, desative logs de caminho bruto, corpos, cabeçalhos sensíveis e rastreamento de SQL com parâmetros nas rotas do app. Endereços administrativos e respostas de revelação contêm segredos.

### Falha HTTP 500 ao criar uma sala

Abra `/api/health` no domínio do deploy. A rota executa `SELECT 1` usando a conexão da aplicação. HTTP 200 com `database: "connected"` confirma a conexão. HTTP 503 com `database: "unavailable"` indica falha de acesso. Consulte o evento `[natilume] Falha interna.` de `GET /api/health` ou `POST /api/rooms` para ver a variável com problema ou um código reconhecido do Prisma ou da conexão.

Se a conexão estiver funcionando e a criação ainda falhar, verifique as migrações no banco usado pelo deploy e confirme que `APP_URL` contém a origem pública. Na Vercel, confira as variáveis do ambiente **Production** e faça um novo deploy após alterá-las. [Variáveis de ambiente na Vercel](https://vercel.com/docs/environment-variables)

## Limites operacionais

- Mínimo de dois participantes e sem teto numérico de produto. O corpo JSON tem limite de **256 KiB** para criar a sala e **1 KiB** para revelar. Títulos têm até 100 pontos de código e nomes até 80, após normalização. A comparação usa NFC e case folding simples do Unicode 17. Acentos e grafias distintas são preservados.
- O banco recebe lotes de até 1.000 participantes por INSERT dentro de uma mesma transação. As transações de criação e revelação têm limites de 20 s e 10 s, respectivamente, após a obtenção da conexão. O pool usa por padrão 5 conexões por processo, com espera configurada em 5 s para conexão e início das transações. Ajuste o limite do provedor e do proxy levando em conta concorrência, timeout e número de réplicas.
- A API retorna todos os nomes disponíveis. A interface pública oferece busca e mostra inicialmente até 75 opções. O painel pagina em 50 linhas. O volume de dados e o custo de armazenamento, transferência e backups aumentam com a quantidade de salas, participantes e consultas. A integração verifica persistência com 1.005 participantes. A capacidade máxima sustentada depende da infraestrutura e precisa ser medida no destino.
