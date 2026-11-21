Você é responsável por implementar uma aplicação web de Amigo Secreto de Natal chamada Natilume pronta para implantação, seguindo rigorosamente o `AGENTS.md` na raiz e os documentos referenciados em `docs/`.

## Objetivo
Construir um site responsivo, visualmente encantador, divertido e fofo, com identidade natalina, para criar salas com participantes e compartilhar **um único link público por sala**. Visitantes selecionam seu próprio nome e revelam seu amigo secreto, sem cadastro, login, senha ou PIN. O nome de quem revelou deve desaparecer da lista disponível para seleção. O sorteio completo deve ser persistido no servidor previamente à primeira revelação; cada participante recebe um destinatário único, diferente de si mesmo.

## Procedimento obrigatório
1. Leia o `AGENTS.md` integralmente e depois os documentos de `docs/` na ordem de execução prevista. Não substitua as especificações por suposições.
2. Antes de codificar, inspecione o repositório e registre um plano curto. Se o repositório estiver vazio, inicialize o projeto conforme a arquitetura documentada.
3. Implemente por etapas sequenciais, respeitando dependências e critérios de aceite. Mantenha a lista de progresso em `docs/PROGRESSO.md` (crie esse arquivo ao iniciar), com status, testes e decisões.
4. Execute lint, checagem de tipos e testes relevantes depois de cada etapa. Corrija falhas antes de avançar. Não marque nada como concluído sem evidência.
5. Priorize robustez do fluxo, confidencialidade das atribuições, persistência, tratamento de concorrência, acessibilidade, responsividade e boa experiência visual.
6. Não invente integrações de mensagens, autenticação de participantes ou funcionalidades excluídas. Se houver ambiguidade técnica não bloqueante, escolha a alternativa mais simples e registre a decisão.
7. Ao terminar, apresente resumo do que foi implementado, arquivos relevantes, comandos para executar e testar, variáveis de ambiente e eventuais limitações de deploy.

## Restrições inegociáveis
- NUNCA criar link individual por participante, PIN, OTP ou login de participante — nem agora, nem no roadmap.
- Um único link público para cada sala, que serve igualmente para todos os participantes.
- Uma URL administrativa secreta separada apenas para o criador gerenciar a sala, sem cadastro, é permitida e necessária para que terceiros não alterem a sala. Ela **não** é um link individual de participante.
- A lista pública só pode conter participantes que ainda não revelaram; o backend deve impedir segunda revelação de forma atômica.
- Sem limite artificial de participantes (exceto mínimo de 2 e limites de segurança de tamanho da requisição/infraestrutura, documentados).
- Nunca expor a tabela de atribuições, IDs de destinatários ou resultado de outra pessoa nos endpoints públicos.
- Reconhecer limitação aceita: antes da revelação, alguém que tenha o link pode escolher o nome de outra pessoa. Remoção após o uso reduz reuso, mas não verifica identidade.

Comece agora pela leitura de `AGENTS.md` e dos documentos. Execute a implementação até cumprir o escopo e respectivos testes.

Para cada etapa concluida faça um commit utilizando conventional commits em ingles