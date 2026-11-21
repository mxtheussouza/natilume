# 08 — Etapa 3: gerenciamento da sala

## Objetivo
Permitir ao criador acompanhar uma sala **sem conta** e sem expor resultados. Como qualquer visitante tem acesso ao link público, o painel deve usar uma URL secreta administrativa distinta da URL pública, nunca enviada aos participantes.

## Requisitos
- Ao criar sala, mostrar link público a compartilhar e link admin a guardar, com explicação explícita.
- `/admin/[adminToken]` valida token de alta entropia no servidor por hash; se inválido, 404/erro genérico.
- Exibir nome da sala, total, quantidade revelada e quantidade pendente.
- Mostrar lista de nomes com status `Pendente`/`Revelou` — **sem mostrar quem tirou quem**.
- Botão copiar link público; opcional copiar link administrativo em área segregada.
- Atualização dos números ao recarregar; se adicionar polling, limitar frequência para evitar carga desnecessária.
- `Cache-Control: no-store` e `Referrer-Policy: no-referrer` nas rotas com segredo; evitar analytics externos e indexação.
- Não permitir edição/re-sorteio após a criação na V1; orientar a criar sala nova se houver erro.

## Não fazer
- Cadastro do administrador ou participantes.
- PINs, links individuais por pessoa, autenticação por e-mail.
- Tela pública de resultados completos.

## Aceite
O link público não acessa dados administrativos; a URL administrativa apenas consulta o andamento. Ausência de conta não pode significar que todos com o link público consigam controlar a sala.
