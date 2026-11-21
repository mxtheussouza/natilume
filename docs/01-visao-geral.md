# 01 — Visão geral

## Produto
Um site web de Amigo Secreto com estética natalina, divertida, acolhedora e moderna. Um administrador cria a sala e cadastra os nomes; o site sorteia os pares de maneira válida e gera um único endereço público compartilhável. Cada participante escolhe seu nome e revela seu destinatário em uma única operação.

## Personas e caminhos
- **Criador da sala**: acessa `/criar`, informa título e nomes, cria o sorteio, copia o link público e guarda uma URL administrativa secreta separada. Não precisa criar conta.
- **Participante**: acessa `/sala/[slug]`, vê os nomes ainda disponíveis, seleciona o próprio, confirma e revela o sorteado. O próprio nome desaparece das opções para os próximos visitantes.
- **Visitante após encerramento**: vê uma mensagem amigável de que todos já revelaram.

## Escopo entregue
- Salas independentes, quantidade não limitada artificialmente, 2+ nomes por sala.
- Sorteio pré-computado, resultado persistido e único por participante.
- Lista pública só com participantes pendentes, atualizada ao revelar e ao recarregar.
- Uma URL pública por sala, painel admin por URL secreta separada.
- UI responsiva, bonita, fofa, temática de Natal, com acessibilidade.

## Fora do escopo, inclusive melhorias futuras
Links individuais por participante, PIN, OTP, login/senha/cadastro de participantes, envio automático de e-mails ou WhatsApp, pagamentos e perfis sociais.

## Risco assumido
Com link único e seleção nominal, não é possível verificar identidade. Um convidado pode usar o nome de outro se agir primeiro. Essa limitação é intencional, não um bug a "corrigir" com verificações adicionais.
