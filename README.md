# Domus Armorum

Site institucional em português feito com React, Vite e GSAP ScrollTrigger. Apresenta a história, a identidade e as informações institucionais da empresa. Não possui catálogo, preços, pedidos ou fluxo de compra.

A seção de atuação descreve de forma neutra os três segmentos informados: armas, munições e equipamentos táticos. A fotografia de armas integra o bloco da história, e a fotografia de munições acompanha as áreas de atuação. As fotos entram com deslocamento e zoom vinculados ao scroll, reversíveis na subida. O botão geral de WhatsApp preenche somente “Olá, vim pelo site.”.

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
- Foto de óculos e protetor auditivo na bancada: Ono Kosuki / [Pexels, 5974014](https://www.pexels.com/photo/protective-headphones-and-glasses-for-carpentry-in-workshop-5974014/). Fotografia real com recorte para destacar os equipamentos, otimizada em WebP. Licença Pexels, sem obrigação de crédito visual. Substitui a foto isolada em fundo branco.
- As fotos são ilustrativas e não representam a estrutura, o estoque ou a equipe da empresa.
- Texto educativo sobre proteção dos olhos e ouvidos: [NSSF](https://www.nssf.org/articles/always-wear-eye-and-ear-protection-when-shooting/).
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
