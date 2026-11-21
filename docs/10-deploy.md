# 10 — Deploy e operação

## Ambiente
- Node versão estável compatível com lockfile.
- PostgreSQL gerenciado em produção; variáveis em provedor seguro, nunca commitadas.
- `.env.example` com `DATABASE_URL` e outras variáveis efetivamente usadas; não incluir chaves verdadeiras.
- Script de migração `prisma migrate deploy` ou equivalente no pipeline.
- Informar comandos locais de instalação, migração, desenvolvimento, teste e build no `README.md`.

## Hospedagem
- Deploy de Next.js em ambiente compatível (Vercel ou Node próprio), banco de dados persistente (Neon, Supabase etc.).
- Configurar HTTPS, política de cache `no-store` para rotas sensíveis e proteção contra indexação de URLs admin.
- Configurar monitoramento de erros sem registrar nomes sorteados, tokens ou dados de resultados.
- Usar estratégia de conexão ao PostgreSQL apropriada ao ambiente serverless (pooling quando necessário).

## Limites e custos
"Quantidade ilimitada" significa **sem limite artificial no produto**, não capacidade infinita. Documentar limites de tamanho de payload, tempo de processamento, conexão, armazenamento e custos de banco. Para milhares de nomes, evitar UI com lista enorme travando o navegador: oferecer filtro de nomes, renderização eficiente e validação no servidor.

## Operação segura
- Backup e recuperação do banco; nunca alterar pares após início do sorteio.
- URL administrativa é segredo: quem a possuir pode consultar o andamento; sem conta não existe recuperação automática da URL admin.
- Se uma resposta de revelação se perder após o commit, a revelação permanece consumida: não retornar o resultado em novo acesso. Informar claramente essa limitação do modo de uso único e orientar a manter a tela aberta até ver a resposta.
- Não oferecer PIN, links individuais ou autenticação de convidados no roadmap.

## Entrega
README atualizado com arquitetura, URL pública vs URL admin, comandos, env vars, limitações, testes e procedimento de deploy.
