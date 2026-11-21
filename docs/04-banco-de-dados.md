# 04 — Modelo de dados e persistência

## `Room`
- `id` UUID / CUID (PK).
- `name` texto (título exibido).
- `publicSlug` string única, opaca, aleatória.
- `adminTokenHash` string única (hash do token secreto de gerenciamento).
- `createdAt` timestamp.
- `status` opcional derivado do total de pendentes; não armazenar dado redundante sem necessidade.

## `Participant`
- `id` UUID / CUID (PK).
- `roomId` FK `Room.id` (onDelete conforme política documentada).
- `name` texto de exibição.
- `normalizedName` texto (único por sala).
- `drawnToParticipantId` FK para `Participant.id`, não nula após criação.
- `revealedAt` timestamp nullable; null = pendente.
- `createdAt` timestamp.

## Restrições e índices
- `Room.publicSlug` UNIQUE; `Room.adminTokenHash` UNIQUE.
- `(roomId, normalizedName)` UNIQUE.
- `(roomId, revealedAt)` index para consultas de pendentes.
- `drawnToParticipantId` UNIQUE global para impedir que destino seja atribuído duas vezes; validar que os pares compartilham a mesma sala no código. Relacionamento autorreferencial devidamente nomeado no ORM.
- Garantir que o mapeamento completo seja salvo **atomicamente** e não existam salas parcialmente criadas visíveis.

## Processos
1. Normalizar e validar nomes.
2. Gerar identificadores, tokens e permutação válida.
3. Persistir sala e participantes/atribuições em transação. Como a FK é autorreferencial, usar estratégia de duas fases dentro da mesma transação ou IDs pré-gerados e inserções compatíveis com o banco.
4. Responder com os dois links. Exibir URL administrativa como segredo: o usuário deve guardá-la, porque não há conta para recuperá-la.
5. Na revelação: localizar participante na sala, fazer atualização condicional `revealedAt IS NULL`, verificar linhas afetadas e, somente em caso de sucesso confirmado, responder com o nome da atribuição. Evitar vazar destino antes da atualização finalizada.

## Privacidade
Jamais retornar `drawnToParticipantId` para a API pública de consulta, nem expor o mapeamento em payload de páginas. Logar somente identificadores técnicos e erros sanitizados, nunca resultados ou URLs admin.
