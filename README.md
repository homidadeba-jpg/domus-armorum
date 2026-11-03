# Domus Armorum

Site institucional em português feito com React, Vite e GSAP ScrollTrigger. Apresenta a história, a identidade e as informações institucionais da empresa. Não possui catálogo, preços, pedidos ou fluxo de compra.

A seção de atuação descreve de forma neutra os três segmentos informados: armas, munições e equipamentos táticos. As fotos de armas e munições compõem a lateral da história em escalas diferentes; a seção de atuação fica livre de fotos sob o título. A fotografia de equipamentos acompanha o bloco institucional com atendimento, razão social, CNPJ, fundação e cidade. O conteúdo apresenta as três áreas de atuação e seu contexto, sem afirmar modelos ou estoque disponível. A seção educativa sobre proteção foi retirada a pedido do responsável. Os recortes diagonais remetem à espada do emblema e se abrem com deslocamento e zoom vinculados ao scroll, reversíveis na subida. Dois desenhos vetoriais ampliados (cartuchos e mira) compõem uma camada de fundo, parcialmente recortada nas bordas das seções. O parallax GSAP desloca essa camada em velocidade diferente do conteúdo, com percurso menor no celular e reversão contínua. A camada fica atrás do conteúdo, em baixo contraste, não recebe cliques e permanece estática quando há preferência por movimento reduzido. O botão geral de WhatsApp preenche somente “Olá, vim pelo site.”.

As três áreas de atuação mantêm os símbolos vetoriais aprovados. Icons made by John Colburn (pistol-gun), Lorc (bullets) and Delapouite (backpack), disponibilizados por [Game-icons.net](https://game-icons.net/) sob CC BY 3.0. Os desenhos originais foram preservados. As atribuições acompanham os próprios arquivos SVG, o `public/illustrations/NOTICE.txt`, a licença e o manifesto de fontes. Não há rodapés de fontes no layout. Não foram usadas imagens geradas.

## Desenvolvimento

```sh
npm install
npm run dev
npm run build
```

## Publicação

Vercel detecta Vite. Comando de build: `npm run build`. Diretório publicado: `dist`.

## Conteúdo e imagens

- Logo original: material enviado pelo responsável no chat em 03/11/2026. O recorte desfocado do print foi retirado da página e da pasta pública.
- Foto de armas e equipamentos em uma bancada: [Kaboompics / Pexels, 5202438](https://www.pexels.com/photo/weapons-on-a-table-5202438/). Foto real, redimensionada em WebP. Licença Pexels, sem obrigação de crédito visual na página.
- Foto de munições: [Pexels, 6091294](https://www.pexels.com/photo/a-row-of-bullets-6091294/). Foto real, redimensionada em WebP. Licença Pexels, sem obrigação de crédito visual na página.
- Foto de equipamentos táticos: Dan Galvani Sommavilla / [Pexels, 7393146](https://www.pexels.com/photo/backpack-with-gloves-on-wall-7393146/). Composição real com mochila, luvas, óculos e acessórios; otimizada em WebP, sem geração de imagem. Licença Pexels, sem crédito visual obrigatório. Substitui a foto de proteção na bancada rejeitada pelo responsável.
- As fotos são ilustrativas e não representam a estrutura, o estoque ou a equipe da empresa.
- A logo original recebida permanece em `public/brand/original-enviado.jpg`. As versões WebP são otimizações da mesma marca.
- Instagram: https://www.instagram.com/domus.armorum/
- WhatsApp completo extraído do link no print: https://wa.me/5545999794330. O número digitado no chat, `(45) 9979-4330`, possui um dígito a menos; a confirmação foi solicitada.
- Ano de fundação, cidade, razão social e CNPJ: informações enviadas pelo responsável. Endereço cadastral de referência: https://cnpj.biz/28698049000189. Endereço completo e horários não foram publicados sem confirmação da operação atual.
- Fontes Barlow Condensed e Manrope hospedadas localmente com Fontsource; ícones Phosphor.

## Acessibilidade e movimento

Movimentos de rolagem contínuos e reversíveis, sem reiniciar opacidade. Respeita `prefers-reduced-motion`, mantém links nativos, navegação por teclado e indicação imediata ao acionar WhatsApp. O estado é restaurado ao retornar à página. Não há vídeo de abertura.

## Verificação

```sh
npm run dev
npm run test:browser
```

O teste usa Playwright para desktop/celular, temas, menu, rolagem, imagens, feedback do WhatsApp e movimento reduzido. Os artefatos ficam em `artifacts/` (não versionados).

## Prévia de compartilhamento

Capa própria com emblema original e tipografia do site, em JPEG 1200 × 630. Open Graph e Twitter Card são entregues no HTML inicial, com URL absoluta de produção e nome de arquivo versionado por conteúdo. Para gerar novamente: `node scripts/prepare-social.mjs`. A exibição e a atualização de prévias já armazenadas dependem do aplicativo de compartilhamento.
