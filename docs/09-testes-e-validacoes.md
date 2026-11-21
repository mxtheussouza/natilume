# 09 — Plano de testes e definição de pronto

## Unitários
- Normalização, rejeição de vazios e duplicatas (com acentos/case conforme regra).
- Sorteio com 2, 3, 10, 100, 1000 participantes: cada ID aparece uma vez como origem e uma vez como destino; nenhum `id === recipientId`.
- Testes repetidos com múltiplas sementes/injeção de random seguro mockável; testar fallback do algoritmo.
- Tratamento de títulos vazios, nomes inválidos e caracteres Unicode.

## Integração (banco real de teste)
- Criar sala e confirmar persistência de todas as atribuições sem visibilidade pública.
- Consultar lista de pendentes antes/depois de revelação e após refresh.
- Verificar que o participante que revelou sai da lista, **não o destinatário**.
- Repetir a mesma revelação: 409 sem destinatário.
- Enviar duas revelações simultâneas do mesmo participante: apenas uma resposta 200, outra 409. Conferir estado final no banco.
- Enviar revelações simultâneas para participantes diferentes: resultados únicos e sem colisão.
- IDs inexistentes ou de outra sala: 400/404 sem vazamento.
- Verificar token público/admin imprevisível, separação de privilégios e cache `no-store`.
- Abrir HTML/RSC e JSON da sala pública: sem `drawnToParticipantId`, token admin ou mapeamento global.
- Simular última revelação e confirmar estado final.

## E2E / usabilidade
- Criar sala de 2, copiar URL, abrir como visitante em janela limpa, selecionar nome e revelar.
- Verificar uso em smartphone 320/375 px e desktop, teclado, foco, leitores de tela e movimento reduzido.
- Confirmar que usuário vê instrução de guardar resultado e que resultado não reaparece após reload.
- Confirmar avisos de link admin secreto e de risco aceito do modo simples.

## Comandos esperados
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build` e `npm run test:e2e` (ou equivalentes documentados). Não declarar sucesso sem executar; se um comando depender de serviços ausentes, informar claramente.

## Critério final
Todas as regras de negócio passam; não há links individuais, PINs nem login; implantação é reproduzível; documentação lista limites operacionais reais e mitigação de falhas de rede na revelação única.
