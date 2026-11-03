# Domus Armorum

Site institucional em português feito com React, Vite e GSAP ScrollTrigger. Apresenta a história, a identidade e as informações institucionais da empresa. Não possui catálogo, preços, pedidos ou fluxo de compra.

A seção de atuação descreve de forma neutra os três segmentos informados: armas, munições e acessórios táticos. As fotografias editoriais de proteção, vestuário e organização não representam estoque ou marcas comercializadas pela empresa. O botão geral de WhatsApp preenche somente “Olá, vim pelo site.”.

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
- Fotografia real de protetores auditivos: JiriMatejicek, [Peltor earmuffs](https://commons.wikimedia.org/wiki/File:Peltor_earmuffs.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Redimensionada em WebP, sem geração de imagem. A versão otimizada permanece sob a mesma licença. É uma imagem editorial de equipamentos de proteção, sem indicação de estoque, representação da loja ou parceria comercial.
- Texto educativo sobre proteção dos olhos e ouvidos: [NSSF](https://www.nssf.org/articles/always-wear-eye-and-ear-protection-when-shooting/).
- Óculos de proteção: WorkWare, [Eyes Safety Glasses](https://commons.wikimedia.org/wiki/File:Eyes_Safety_Glasses.jpg), CC BY-SA 4.0. Redimensionada em WebP, sob a mesma licença.
- Mochila: ~riley, [Tactical backpack at Lower Falls Trail](https://commons.wikimedia.org/wiki/File:Tactical_backpack_at_Lower_Falls_Trail.jpg), CC BY-SA 4.0. Redimensionada em WebP, sob a mesma licença.
- Vestuário: Ocdp, [Cargo pants 001](https://commons.wikimedia.org/wiki/File:Cargo_pants_001.jpg), CC0. Redimensionada em WebP.
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
