# AGENTS.md — Instruções permanentes para agentes de código

## Missão e fonte da verdade
Implementar e manter um site de Amigo Secreto natalino, sem cadastro de participantes, com uma URL pública compartilhada por sala e revelação única de cada participante. Os documentos em `docs/` são a especificação autoritativa. Em caso de conflito: **regras inegociáveis deste arquivo > docs/02-regras-de-negocio.md > demais documentos**. Não alterar decisões de produto sem pedido explícito.

## Ordem de leitura
1. [`docs/01-visao-geral.md`](docs/01-visao-geral.md) — propósito, públicos e escopo.
2. [`docs/02-regras-de-negocio.md`](docs/02-regras-de-negocio.md) — invariantes e fluxo crítico.
3. [`docs/03-arquitetura.md`](docs/03-arquitetura.md) — stack, fronteiras e API.
4. [`docs/04-banco-de-dados.md`](docs/04-banco-de-dados.md) — entidades e índices.
5. [`docs/05-design-system.md`](docs/05-design-system.md) — direção de arte e acessibilidade.
6. [`docs/06-etapa-mvp.md`](docs/06-etapa-mvp.md) — implementação funcional.
7. [`docs/07-etapa-interface-natalina.md`](docs/07-etapa-interface-natalina.md) — refinamento visual.
8. [`docs/08-etapa-administracao.md`](docs/08-etapa-administracao.md) — painel e segurança admin.
9. [`docs/09-testes-e-validacoes.md`](docs/09-testes-e-validacoes.md) — testes e aceite.
10. [`docs/10-deploy.md`](docs/10-deploy.md) — produção e operação.

## Sequência de trabalho
- **Etapa 1: MVP funcional** — leia 01, 02, 03, 04, 06, 09. Entregue criação, sorteio persistido, URL pública, revelação atômica, remoção da lista, encerramento.
- **Etapa 2: visual natalino** — leia 05, 07, 09. Entregue interface criativa, animações com movimento reduzido respeitado, responsividade e acessibilidade.
- **Etapa 3: administração** — leia 08, 09. Entregue acesso administrativo secreto sem conta, resumo de status e cópia de links. Não revelar os pares na administração por padrão.
- **Etapa 4: qualidade/deploy** — leia 09 e 10. Automatize testes e documente deploy, ambiente, migrações e limites reais.
- Documente decisões e evolução em `docs/PROGRESSO.md`, criado pelo agente. Não avance com falhas conhecidas no fluxo central.

## Regras que NUNCA devem ser violadas
- Um único link **público da sala** compartilhado entre todas as pessoas; nenhum link individual.
- Nenhum cadastro, login, senha, PIN ou código para participantes.
- Criar um mapeamento bijetivo de participantes, sem autoatribuição, **antes** de revelar qualquer resultado.
- Cada participante revela no máximo uma vez; o backend, não apenas a interface, aplica a regra.
- Depois de revelar, seu nome desaparece da lista pública dos disponíveis. A pessoa sorteada não é removida da lista de quem ainda precisa revelar, exceto quando ela própria revelar.
- Enquanto houver nomes pendentes, a sala permanece ativa; ao esgotar, exibir estado de encerramento.
- Quantidade arbitrária de participantes, com mínimo 2 e sem `maxParticipants` de produto. Cuidado com processamento, limites de payload e escala real.
- Não expor pares, IDs de destino ou informações sensíveis em JSON público, HTML renderizado, logs de aplicação e analytics.
- Não introduzir links individuais, PINs ou qualquer verificação individual, mesmo como sugestão futura.
- Aceitar e documentar o risco de usurpação de nome antes da primeira revelação em modo simples.

## Engenharia
- Usar TypeScript estrito, validação server-side, persistência real, migrações e testes automáticos.
- Não confiar no estado do cliente para autorizar revelação; implementar `updateMany` condicional ou UPDATE equivalente dentro de transação, com conferência de 1 linha alterada.
- Para concorrência real, testar duas requisições simultâneas para a mesma pessoa: só uma pode receber o resultado; outra recebe conflito sem nome. Não retornar resultado antes de commit bem-sucedido.
- Nunca expor `drawnToParticipantId` em loaders, componentes server-rendered públicos ou retorno de rotas de consulta.
- Usar tokens não previsíveis de alta entropia para URL pública e URL admin; armazenar hash do segredo administrativo se viável; impedir cache de respostas com segredos/resultados; `Referrer-Policy: no-referrer` nas áreas com tokens.
- Criar arquivos `.env.example` sem credenciais reais, README operacional, estados de erro, carregamento e telas vazias.
- Não apagar dados reais nem refazer sorteios após revelações. Registrar decisões sobre edição/cancelamento de sala.
- Verificar `lint`, `typecheck`, testes unitários/integrados e build, anotando resultados.

## Definição de pronto
O projeto só estará pronto quando todas as condições de `docs/09-testes-e-validacoes.md` forem atendidas, com execução local reproduzível e documentação de implantação. Se uma limitação for imposta pelo ambiente, registrar claramente o que falta e como validar.
