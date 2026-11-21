# 06 — Etapa 1: MVP funcional

## Dependências
Ler documentos 01–04 e 09. Executar antes do polimento artístico.

## Tarefas
1. Inicializar Next.js TypeScript estrito, lint, variáveis de ambiente e PostgreSQL/Prisma.
2. Criar schema e migração com salas e participantes.
3. Implementar validador de título/nome, normalizador e detecção de duplicatas.
4. Implementar gerador testável de permutação sem autoatribuições e com destinos únicos.
5. Criar `POST /api/rooms`, transação de sala + mapeamento e segredos independentes de URL pública/admin.
6. Criar `GET /api/rooms/[slug]` com lista somente de pendentes.
7. Criar `POST /api/rooms/[slug]/reveal` com atualização condicional e transação; retornar resultado **uma vez**.
8. Criar home, `/criar` e `/sala/[slug]` usáveis em celular, com carregamento, erros, atualização de estado e encerramento.
9. Atualizar a lista depois do sucesso e refazer consulta ao entrar na sala, para lidar com acessos em paralelo.
10. Proteger cache e não serializar atribuições para frontend.
11. Implementar testes unitários e integração de criação/revelação/conflito.

## Critérios de aceite
- Uma sala com 2, 3, 10 e 100+ participantes mantém bijeção correta, sem autoatribuição.
- Em uma sala de 10, revelar para um participante remove **seu nome** da lista; o destinatário continua selecionável até que revele por conta própria.
- Duas requisições simultâneas ao mesmo ID não retornam o mesmo resultado: exatamente uma recebe HTTP 200; outra 409 (ou conflito equivalente sem destinatário).
- O nome não reaparece após refresh; completar todos os nomes exibe encerramento.
- Nenhum endpoint público de consulta revela a atribuição ou segredo administrativo.
- Sem login de participante, PIN ou links individuais.
