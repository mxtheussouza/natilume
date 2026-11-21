# 05 — Direção visual natalina

## Atmosfera
Natal fofo, divertido e sofisticado, sem aparência infantilizada ou genérica. Sensação de cartão de Natal contemporâneo: ilustrações originais de presentes, renas simpáticas, estrelas, luzinhas, flocos de neve, pinheiros e pequenos detalhes decorativos. Interface deve ser bonita mesmo sem imagens externas.

## Tokens sugeridos (ajustáveis)
- Verde pinheiro `#164B3C` (títulos, áreas de destaque).
- Verde claro `#DDEDE3` (superfícies suaves).
- Vermelho cereja `#CE4B52` (CTA e detalhes).
- Creme `#FFF9EF` (fundo principal).
- Dourado suave `#E7B96B` (acentos).
- Tinta escura `#26382E` (texto).
- Branco `#FFFFFF` (cards).

Verificar contraste WCAG AA para textos/botões; não aplicar combinações claras sem testes de contraste.

## Elementos
- Ilustração hero original com árvore, presentes ou Papai Noel simpático; evitar marcas/cópias de ilustrações de terceiros.
- Tipografia de títulos amistosa, forte e legível; corpo sem serifa acessível.
- Cards arredondados e sombra leve; detalhes gráficos desenhados em SVG/CSS.
- Neve discreta, pequenas transições e revelação festiva (confete leve, carta abrindo, brilho), obedecendo `prefers-reduced-motion`.
- Layout mobile-first com áreas de toque confortáveis e seletor de nomes fácil de usar.

## Páginas
- **Home:** hero acolhedor, descrição de três passos, CTA principal.
- **Criar sala:** formulário claro com nome, participante por linha, contagem e prévia da lista; validação visível.
- **Sala:** cabeçalho festivo, progresso sem divulgar resultados, lista pendente, confirmação de identidade autoatribuída e botão grande de revelar.
- **Revelação:** experiência alegre; nome do destinatário em destaque, mensagem de guardar segredo. Não permitir revelação repetida.
- **Encerramento:** estado final celebrativo e inequívoco.
- **Admin:** mesmo design, porém painel funcional e discreto, com aviso de segredo do link.

## Acessibilidade
Semântica correta, etiquetas de formulário, estados `aria-live` sem anunciar segredo antes de ação explícita, navegação por teclado, foco evidente, contraste AA, botões grandes e nenhuma informação transmitida apenas por cor.
