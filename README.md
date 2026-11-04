# Domus Armorum

Site institucional em português feito com React, Vite e GSAP ScrollTrigger. Apresenta a história, a identidade e as informações institucionais da empresa. Não possui catálogo, preços, pedidos ou fluxo de compra.

A seção de atuação descreve de forma neutra os três segmentos informados: armas, munições e equipamentos táticos. Cada área de atuação é acompanhada por uma fotografia real correspondente, sem repetição em outras seções. Os textos ocupam colunas amplas no desktop e toda a largura no celular. A história e os dados institucionais ficam em blocos tipográficos. O hero apresenta o emblema original sem painel ou halo. O conteúdo apresenta as três áreas de atuação e seu contexto, sem afirmar modelos ou estoque disponível. A seção educativa sobre proteção foi retirada a pedido do responsável. Os recortes diagonais remetem à espada do emblema e se abrem com deslocamento e zoom vinculados ao scroll, reversíveis na subida. Dois desenhos vetoriais ampliados (cartuchos e mira) compõem uma camada de fundo, parcialmente recortada nas bordas das seções. O parallax GSAP desloca essa camada em velocidade diferente do conteúdo, com percurso menor no celular e reversão contínua. A camada fica atrás do conteúdo, em baixo contraste, não recebe cliques e permanece estática quando há preferência por movimento reduzido. O botão geral de WhatsApp preenche somente “Olá, vim pelo site.”.

Os símbolos com aparência de ícones foram retirados do layout e substituídos pelas fotografias reais já aprovadas. Nenhuma imagem gerada foi utilizada.

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

## Idiomas

Português (padrão), inglês e espanhol, com seletor nativo discreto ao lado do tema. Textos, rótulos acessíveis, descrições das imagens, título da página e feedback do WhatsApp estão traduzidos. A escolha fica salva no navegador; `?lang=en` e `?lang=es` permitem abrir um idioma diretamente, preservando os demais parâmetros do link. A troca atualiza o ScrollTrigger sem reiniciar as animações. A mensagem geral do WhatsApp acompanha o idioma; razão social, CNPJ, contatos e nome Jonas Jr. são preservados. As prévias sociais no HTML inicial continuam em português.

## Revisão visual de 04/11/2026

Ícones substituídos por fotos reais, sem painéis coloridos. Hero sem caixa ou halo, textos ampliados no celular e fotografias usadas uma vez por segmento. Build e verificações estáticas passaram. A rodada visual desta revisão não foi concluída: Edge e Chromium fecharam na inicialização do Playwright, e o navegador local do Computer Use estava desativado nas configurações.

## Refinamento da marca e do movimento

Emblema maior e alinhado à apresentação: lateral direita no desktop e ao lado do texto no celular. Numeração das áreas removida. Entrada do hero coordenada em timeline; fotos com deslocamento menor, zoom reduzido e chegada concentrada na entrada da tela. Os movimentos de scroll continuam contínuos e reversíveis, com limpeza via GSAP context e respeito a movimento reduzido.

O fundo preto do hero foi removido após esclarecimento do responsável. O emblema usa um WebP com alpha real, derivado dos pixels monocromáticos do original com `node scripts/prepare-transparent-logo.mjs`, sem redesenho. O papel branco e os espaços negativos tornam-se transparentes; a cor do traço acompanha o tema por CSS. O arquivo original enviado permanece preservado. A versão da ferramenta generativa foi descartada por alterar traços da marca. O único botão flutuante da empresa usa o símbolo preenchido do WhatsApp, com contraste reforçado e resposta de toque; o feedback imediato de abertura e o contato permanecem preservados.
