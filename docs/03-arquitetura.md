# 03 — Arquitetura e contratos

## Stack sugerida
- Next.js (App Router), React, TypeScript strict.
- Tailwind CSS, componentes próprios acessíveis, ícones Lucide, animações leves em CSS (ou biblioteca apenas se necessária).
- PostgreSQL, Prisma ORM, migrações versionadas.
- Testes com Vitest e Playwright (ou equivalentes fundamentados).
- Hospedagem compatível com Node e PostgreSQL (por exemplo Vercel + Neon/Supabase).

Use versões estáveis compatíveis no momento do desenvolvimento, documentando versões exatas no lockfile; não deixar dependências flutuantes.

## Páginas
- `/` — landing page temática com chamada para criar sala.
- `/criar` — formulário de sala e participantes (entrada um por linha, além de suporte a adição individual se simples).
- `/sala/[slug]` — experiência pública, lista apenas de pendentes, confirmação e revelação.
- `/admin/[adminToken]` — painel de gerenciamento por URL secreta. **Não confundir com o link público único enviado aos participantes**.
- `/not-found` ou estados equivalentes — URL inexistente/inválida.

## Contratos HTTP propostos
- `POST /api/rooms`: `{name, participants: string[]}`; resposta `{roomUrl, adminUrl, totalParticipants}`. Gerar e persistir atribuições na mesma transação de criação.
- `GET /api/rooms/[slug]`: `{name, totalParticipants, pendingCount, availableParticipants:[{id,name}], status}`. Nenhuma atribuição, nenhum `drawnToParticipantId`, nenhum token admin.
- `POST /api/rooms/[slug]/reveal`: `{participantId}`; sucesso 200 `{recipientName}` **somente para a primeira requisição vencedora**; 409 se já revelou; 400 entrada inválida; 404 se não pertence à sala. Todas sem cache.
- `GET /api/admin/[adminToken]`: `{name, totalParticipants, revealedCount, pendingCount, participants:[{name,revealed}], publicUrl}`. Não devolver resultados individuais.

## Segurança e concorrência
- URLs públicas não previsíveis (slug contém token aleatório com pelo menos 128 bits de entropia); evitar nomes pessoais no slug quando possível.
- URL admin contém segredo aleatório independente e forte (pelo menos 192 bits); hash do token armazenado em banco, comparação com a representação segura, jamais incluído em APIs públicas.
- Respostas de revelação e administração `Cache-Control: no-store`; metadados SEO e analytics não devem vazar resultado ou token; `Referrer-Policy: no-referrer` e não compartilhar token admin com scripts externos.
- Server-side validation, limitar tamanho de requisição por segurança operacional e registrar limites de infraestrutura (não limite artificial de pessoas).
- Em conflito de concorrência, um único UPDATE condicional dentro de transação deve definir vencedor. Dependendo do banco/driver, tratar deadlock/serialization e retry sem jamais duplicar resultado.
- O backend deve manter todos os dados secretos, mesmo que componentes React server-side sejam serializados.

## Estados de UI
Carregando, sala inexistente, lista disponível, confirmação, revelando, revelado com opção de ocultar o cartão (sem repetir a revelação), nome já usado, sala encerrada, erro de rede com tentativa de atualizar o estado. **Nota**: se a resposta de uma revelação se perder por falha de rede após o commit, o destinatário não pode ser recuperado pelo modo simples sem enfraquecer a regra de revelação única. Antes da requisição, avisar para manter a página aberta; tratar o caso com mensagem honesta.
