# Domus Armorum

Site institucional em português feito com React, Vite e GSAP ScrollTrigger. Apresenta a história, a identidade e as informações institucionais da empresa. Não possui catálogo, preços, pedidos ou fluxo de compra.

## Desenvolvimento

```sh
npm install
npm run dev
npm run build
```

## Publicação

Vercel detecta Vite. Comando de build: `npm run build`. Diretório publicado: `dist`.

## Conteúdo e imagens

- Logo original e fotografia do emblema: materiais enviados pelo responsável no chat em 03/11/2026. A foto é um recorte da publicação visível no print do Instagram. Sua resolução de origem é limitada; não foi usada fotografia genérica nem imagem gerada.
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
