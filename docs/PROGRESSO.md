# Progresso

O repositório começou com as especificações e sem código da aplicação.

1. MVP concluído. Inicializar Next.js e PostgreSQL com Prisma, depois implementar criação, consulta e revelação e validar com banco real.
2. Interface natalina concluída. Aplicar o sistema visual e verificar responsividade, teclado e movimento reduzido.
3. Administração concluída. Implementar painel por segredo e verificar a separação entre as rotas.
4. Preparação para deploy concluída com validação local. Executar a suíte completa, automatizar verificações e documentar a implantação.

A entrega será preparada neste checkout para implantação em Node.js com PostgreSQL.

## Etapa 1 — MVP

- Next.js App Router, TypeScript estrito e Prisma com PostgreSQL 17. A migração usa FK autorreferencial diferida para persistir o sorteio completo em lotes na mesma transação.
- A revelação atualiza somente um registro pendente da própria sala. O destinatário só é retornado após o commit. O segredo administrativo é armazenado como hash SHA-256 e é independente do slug público.
- O POST de criação aceita até 256 KiB. Os nomes preservam acentos, com trim, espaços internos normalizados, NFC e comparação em minúsculas. A filtragem na sala limita as opções inicialmente renderizadas.
- Os testes usam o banco separado `natilume_test` e não removem dados. Migração, lint, typecheck, build e auditoria executados com sucesso. Vitest passou em 28 casos, incluindo sorteio persistido de 1.005 nomes e concorrência com 200 e 409 sem destinatário.
- ESLint 9 é a versão compatível com todos os plugins de lint do Next instalados. O override de Effect corrige uma dependência transitiva da ferramenta de migração.

## Etapa 2 — Interface natalina

- Ilustração original em SVG, paleta pinheiro, cereja e creme, fontes Fraunces e DM Sans servidas localmente e ícones Lucide.
- Formulário com prévia, diálogo nativo com confirmação, estados de erro e encerramento, e cartão de revelação com foco e movimento reduzido.
- Lint, typecheck, build, 28 testes unitários e de integração e 5 cenários Playwright passaram. Foram verificados 320, 375, 768 e 1440 px, contraste automatizado com axe, navegação por teclado, foco, cópia do link e abertura em contexto limpo. Home inspecionada visualmente a 375 e 1440 px.

## Etapa 3 — Administração

- Painel e API consultam o andamento pelo hash do token secreto. Exibem apenas nomes, status e totais. A lista tem busca e paginação para salas grandes e os totais são atualizados ao recarregar.
- O criador pode copiar os dois endereços após a criação e abrir o painel em outra aba. Na V1, edição, cancelamento e novo sorteio de uma sala existente ficam fora do painel. Uma correção pede a criação de nova sala. As relações no banco impedem exclusão acidental de salas com participantes.
- A validação do link acontece antes de iniciar a resposta das rotas dinâmicas, permitindo devolver HTTP 404 também em HTML. O carregamento durante a navegação para o formulário tem fallback próprio.
- Lint, typecheck, build, 29 casos de Vitest e 6 cenários Playwright passaram. Confirmados HTTP 404 para slug público e token inexistente no painel, cabeçalhos privados, cópia e atualização após revelação.

## Etapa 4 — Qualidade e implantação

- Documentados instalação, migrações, variáveis, rollout, backup, limites reais e proteção de logs e cache. O workflow de CI provisiona PostgreSQL e executa a suíte em Node.js 24.
- Produção exige `APP_URL` com a origem pública para gerar links. A comparação de nomes usa case folding simples do Unicode 17 com NFC, preservando acentos e grafias distintas. O arquivo de mapeamento é gerado no `postinstall`.
- `npm ci --include=dev`, lint, typecheck, 32 testes unitários e de integração, build, 10 cenários Playwright e auditoria npm passaram. Uma instância descartável PostgreSQL 17.12 confirmou a inicialização dos dois bancos, a migração do zero e os 10 casos de integração.
- O build servido em modo produção retornou HTTP 200 e 409 para revelações HTTP concorrentes do mesmo nome. HTML, RSC e JSON públicos foram verificados. Uma falha de rede simulada após o commit manteve o nome consumido.
- Acessibilidade verificada com axe, árvore ARIA, teclado, foco e movimento reduzido em Chromium. A sessão manual com VoiceOver ou NVDA permanece pendente e o roteiro está no README.
- O workflow ainda não foi executado em um runner remoto. A aplicação foi preparada para implantação em Node.js com PostgreSQL e validada localmente.

## Diagnóstico da criação em produção

- O deploy na Vercel retornou HTTP 400 para JSON malformado e HTTP 500 tanto para uma criação válida quanto para uma consulta pública que lê o banco. A mesma aplicação, executada localmente com o Supabase configurado no checkout, criou uma sala fictícia com HTTP 201 e confirmou a consulta pública e administrativa com HTTP 200. A causa específica da falha de acesso ao banco do deploy depende dos logs e da configuração da Vercel.
- O formulário sincroniza a prévia com o texto digitado antes da hidratação e mostra o erro recebido da API. As rotas registram o nome da operação e o problema de configuração ou código reconhecido sem nomes, tokens ou credenciais. O `.env.example` voltou a usar a configuração local documentada.
- Lint, typecheck, build, 32 testes unitários e de integração e 12 cenários Playwright passaram. As duas regressões de interface também passaram em desenvolvimento. O build de produção servido localmente com `DATABASE_URL` vazia reproduziu os dois 500 e registrou a variável ausente no log.

## Verificação da conexão com o banco

- `GET /api/health` verifica a conexão usada pela aplicação com `SELECT 1`. Responde sem cache e registra o diagnóstico de falhas somente no servidor.
- O build servido localmente retornou HTTP 200 com PostgreSQL real e HTTP 503 com um endereço de banco inacessível. Passaram lint, typecheck, build, 32 testes unitários e de integração e 13 cenários Playwright.
