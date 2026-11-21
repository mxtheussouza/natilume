# Progresso

O repositório começou com as especificações e sem código da aplicação.

1. MVP concluído. Inicializar Next.js e PostgreSQL com Prisma, depois implementar criação, consulta e revelação e validar com banco real.
2. Interface natalina em andamento. Aplicar o sistema visual e verificar responsividade, teclado e movimento reduzido.
3. Administração pendente. Implementar painel por segredo e verificar a separação entre as rotas.
4. Qualidade e deploy pendentes. Executar a suíte completa, automatizar verificações e documentar a implantação.

A entrega será preparada neste checkout para implantação em Node.js com PostgreSQL.

## Etapa 1 — MVP

- Next.js App Router, TypeScript estrito e Prisma com PostgreSQL 17. A migração usa FK autorreferencial diferida para persistir o sorteio completo em lotes na mesma transação.
- A revelação atualiza somente um registro pendente da própria sala. O destinatário só é retornado após o commit. O segredo administrativo é armazenado como hash SHA-256 e é independente do slug público.
- O POST de criação aceita até 256 KiB. Os nomes preservam acentos, com trim, espaços internos normalizados, NFC e comparação em minúsculas. A filtragem na sala limita as opções inicialmente renderizadas.
- Os testes usam o banco separado `natilume_test` e não removem dados. Migração, lint, typecheck, build e auditoria executados com sucesso. Vitest passou em 28 casos, incluindo sorteio persistido de 1.005 nomes e concorrência com 200 e 409 sem destinatário.
- ESLint 9 é a versão compatível com todos os plugins de lint do Next instalados. O override de Effect corrige uma dependência transitiva da ferramenta de migração.
