# 02 — Regras de negócio e invariantes

## Regras fundamentais
1. Só é possível criar sala com **ao menos 2 participantes**.
2. Não impor teto de participantes por produto; podem existir limites técnicos razoáveis de tamanho de nome, nome da sala e corpo HTTP, com mensagem de erro clara e documentação.
3. Remover espaços extras, rejeitar nomes vazios e duplicatas normalizadas por sala (comparação case-insensitive e com normalização Unicode; não confundir nomes distintos indevidamente). Exibir validação antes de criar.
4. Sorteio completo é realizado uma única vez na criação: bijeção de todos os IDs para todos os IDs, sem ponto fixo. Não sortear destinatário no clique.
5. Destinatário é único: cada nome recebe exatamente uma atribuição e é escolhido exatamente uma vez.
6. A ação pública revela o destino da pessoa selecionada **uma vez**. Depois disso, ela não pode repetir.
7. O nome que desaparece da lista pública após revelar é o de **quem acessou e revelou**, NÃO o de quem foi sorteado.
8. Toda operação de revelação consulta o banco e marca o estado condicionalmente em transação. Duas requisições concorrentes não podem obter o mesmo resultado.
9. Se não houver pendentes, página indica sala encerrada, sem divulgar os pares.
10. Informações de outras atribuições jamais são enviadas ao cliente.
11. Depois da criação, não alterar participantes/atribuições na primeira versão; para outro grupo, criar nova sala.
12. A sala pode ser acessada pelo mesmo link público por todos. Não construir mecanismos de identidade por e-mail, telefone, PIN, link individual ou login.

## Algoritmo recomendado
- Embaralhe uma cópia da lista de IDs com Fisher–Yates criptograficamente aleatório (gerador seguro do ambiente) e rejeite a permutação caso algum `source[i] === target[i]`.
- A chance de uma tentativa válida aproxima-se de 1/e para grupos maiores; logo o custo esperado é linear. Para 2 participantes, uma única permutação válida existe.
- Empregar limite defensivo de tentativas e fallback determinístico válido com **deslocamento cíclico aleatório diferente de zero** (evita loop teoricamente infinito), mantendo a regra de não repetição. O fallback não precisa preservar uniformidade, mas não deve ocorrer normalmente.
- Conservar o resultado apenas no servidor e validar os invariantes antes de persistir.

## Transição do participante
`PENDENTE -> REVELADO` é irreversível. A chamada recebe um `participantId` pertencente à sala. A operação atômica muda exatamente um registro se ainda pendente. Somente a chamada vencedora recebe `{ recipientName }` e o servidor retorna `Cache-Control: no-store`. Chamadas perdedoras recebem HTTP 409 e mensagem genérica (sem destinatário).

## Limitações de segurança aceitas
O modo simples impede reuso do nome **depois** de revelado, mas não prova identidade **antes** da revelação. O administrador não pode garantir que cada pessoa física revelou usando o próprio nome. Não adicionar PIN/links individuais para compensar essa limitação.
