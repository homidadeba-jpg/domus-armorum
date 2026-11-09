# Domus Armorum

Site institucional em italiano, inglês, espanhol e português, feito com React, Vite, Three.js, GSAP e Lenis. Apresenta a identidade da Domus Armorum, a loja em Cascavel e os projetos de conexões e experiências culturais na Itália.

A identidade visual utiliza grafite, oliva e latão, tipografia editorial e uma textura discreta. O emblema original é a fonte do relevo da cena 3D: os pixels alpha formam uma malha sobre uma base metálica com bordas chanfradas. Materiais, luzes, perspectiva e movimento são renderizados com Three.js, sem imagem gerada ou alteração do arquivo original. O modelo responde ao ponteiro e à rolagem. A cena é carregada separadamente e só renderiza quando está visível.

A loja e as conexões na Itália têm seções próprias e acessos equivalentes. O conteúdo internacional se baseia nas conversas fornecidas pelo responsável, com foco institucional em cultura, encontros e gastronomia. Não são anunciados pacotes, valores, datas, parceiros identificados ou disponibilidade. Endereço completo não é publicado. As fotografias são ilustrativas.

## Desenvolvimento

```sh
npm install
npm run dev
npm run build
```

## Publicação

Vercel detecta Vite. Comando de build: `npm run build`. Diretório publicado: `dist`.

- Repositório: https://github.com/homidadeba-jpg/domus-armorum
- Branch de produção: `main`
- Painel Vercel: https://vercel.com/jonas-jr/domus-armorum
- URL de produção: https://domus-armorum.vercel.app/
- Publicação contínua pela integração GitHub–Vercel: commit e push em `main`, seguidos da verificação do status do deploy e da URL pública. Reutilizar as conexões existentes.

## Conteúdo e imagens

- Logo original: material enviado pelo responsável no chat em 03/11/2026. O recorte desfocado do print foi retirado da página e da pasta pública.
- Foto de armas e equipamentos em uma bancada: [Kaboompics / Pexels, 5202438](https://www.pexels.com/photo/weapons-on-a-table-5202438/). Foto real, redimensionada em WebP. Licença Pexels, sem obrigação de crédito visual na página.
- Foto de munições: [Pexels, 6091294](https://www.pexels.com/photo/a-row-of-bullets-6091294/). Foto real, redimensionada em WebP. Licença Pexels, sem obrigação de crédito visual na página.
- Foto de equipamentos táticos: Dan Galvani Sommavilla / [Pexels, 7393146](https://www.pexels.com/photo/backpack-with-gloves-on-wall-7393146/). Composição real com mochila, luvas, óculos e acessórios; otimizada em WebP, sem geração de imagem. Licença Pexels, sem crédito visual obrigatório. Substitui a foto de proteção na bancada rejeitada pelo responsável.
- Paisagem italiana: imagem de atmosfera do Unsplash, arquivo `public/experiences/italia.webp`. Origem e licença em `public/experiences/NOTICE.txt`; não representa um roteiro confirmado.
- As fotos são ilustrativas e não representam a estrutura, o estoque ou a equipe da empresa.
- A logo original recebida permanece em `public/brand/original-enviado.jpg`. As versões WebP são otimizações da mesma marca.
- Instagram: https://www.instagram.com/domus.armorum/
- WhatsApp completo extraído do link no print: https://wa.me/5545999794330. O número digitado no chat, `(45) 9979-4330`, possui um dígito a menos; a confirmação foi solicitada.
- Localização confirmada pelo responsável em 06/11/2026: Cascavel, Paraná, Brasil. O endereço italiano informado anteriormente foi corrigido e retirado da página. O endereço completo e os horários devem ser consultados pelo canal de contato até serem confirmados. Razão social e CNPJ brasileiros foram restaurados conforme os dados já existentes no projeto: AWM Armas e Munições LTDA, 28.698.049/0001-89.
- Fontes Barlow Condensed e Manrope hospedadas localmente com Fontsource; ícones Phosphor.

## Acessibilidade e movimento

Movimentos de rolagem contínuos e reversíveis, sem reiniciar opacidade. Respeita `prefers-reduced-motion`, mantém links nativos, navegação por teclado e indicação imediata ao acionar WhatsApp. O estado é restaurado ao retornar à página. Não há vídeo de abertura.

## Verificação

```sh
npm run dev
npm run test:browser
```

Os testes usam Playwright para desktop/celular, os quatro idiomas, temas, menu, rolagem, imagens e feedback do WhatsApp. A verificação de movimento cobre a cena WebGL, resposta visual ao ponteiro, Lenis e âncoras, cabeçalho fixo, mudanças dinâmicas de movimento reduzido, descarte do canvas e fallback sem GPU ou com perda de contexto. Use `TEST_BROWSER_CHANNEL=msedge` para testar com o Edge instalado, ou instale Chromium com Playwright. Os artefatos ficam em `artifacts/` (não versionados).

## Prévia de compartilhamento

Capa própria com emblema original e tipografia do site, em JPEG 1200 × 630. Open Graph e Twitter Card são entregues no HTML inicial, com URL absoluta de produção e nome de arquivo versionado por conteúdo. Para gerar novamente: `node scripts/prepare-social.mjs`. A exibição e a atualização de prévias já armazenadas dependem do aplicativo de compartilhamento.

## Idiomas

Italiano, inglês, espanhol e português, com seletor nativo ao lado do tema. A seleção inicial segue esta ordem: idioma válido no parâmetro `?lang=it|en|es|pt`, escolha manual salva no navegador, primeiro idioma compatível da lista de preferências do navegador e italiano como padrão quando não houver correspondência. Não há solicitação de localização nem consulta externa por IP. Somente escolhas manuais ficam salvas; parâmetros e âncoras do link são preservados. Textos, rótulos acessíveis, descrições das imagens, título, descrição e feedback do WhatsApp acompanham o idioma. A troca atualiza o ScrollTrigger sem reiniciar as animações. A prévia social no HTML inicial e a capa de compartilhamento usam italiano e a localização em Cascavel, Paraná, Brasil. O crédito “Desenvolvido por Jonas Jr” permanece visível com o link do autor.

Verificação da resolução de idiomas e integridade das traduções: `npm run test:languages`. O teste de navegador também cobre os quatro idiomas em desktop e celular, persistência, precedência da URL, navegação pelo histórico, armazenamento indisponível, localização em Cascavel e dados da empresa.

## Histórico de versões anteriores

As notas abaixo registram decisões anteriores à reformulação de 09/11/2026; detalhes de layout e movimento foram substituídos pela implementação descrita acima.

## Revisão visual de 04/11/2026

Ícones substituídos por fotos reais, sem painéis coloridos. Hero sem caixa ou halo, textos ampliados no celular e fotografias usadas uma vez por segmento. Build e verificações estáticas passaram. A rodada visual desta revisão não foi concluída: Edge e Chromium fecharam na inicialização do Playwright, e o navegador local do Computer Use estava desativado nas configurações.

## Refinamento da marca e do movimento

Emblema maior e alinhado à apresentação: lateral direita no desktop e ao lado do texto no celular. Numeração das áreas removida. Entrada do hero coordenada em timeline; fotos com deslocamento menor, zoom reduzido e chegada concentrada na entrada da tela. Os movimentos de scroll continuam contínuos e reversíveis, com limpeza via GSAP context e respeito a movimento reduzido.

O fundo preto do hero foi removido após esclarecimento do responsável. O emblema usa um WebP com alpha real, derivado dos pixels monocromáticos do original com `node scripts/prepare-transparent-logo.mjs`, sem redesenho. O papel branco e os espaços negativos tornam-se transparentes; a cor do traço acompanha o tema por CSS. O arquivo original enviado permanece preservado. A versão da ferramenta generativa foi descartada por alterar traços da marca. O único botão flutuante da empresa usa o símbolo preenchido do WhatsApp, com contraste reforçado e resposta de toque; o feedback imediato de abertura e o contato permanecem preservados.

## Indicador de rolagem

A antiga barra foi substituída por um pequeno cartucho vetorial horizontal. Ele fica totalmente fora da tela no início, atravessa a borda inferior do cabeçalho conforme a posição real de scroll e sai completamente no final. Uma marca discreta de passagem acompanha a saída e também desaparece. O movimento é reversível e recalculado em mudanças de tamanho e idioma, sem temporizadores, interações ou deslocamento do conteúdo. O indicador é decorativo e fica oculto para tecnologias assistivas e com movimento reduzido.

O cartucho foi reduzido para 72 px no desktop e 58 px no celular. Uma linha de 1 px cresce até sua parte traseira, retrai ao subir e permanece preenchida no fim da página, após a saída do cartucho.

## Cabeçalho no celular

Cabeçalho fixo, sem transformações de rolagem, com `safe-area-inset-top` e `viewport-fit=cover`. Uma única variável de altura mantém o espaço inicial e o afastamento dos links internos; o menu móvel começa abaixo de todo o cabeçalho, incluindo o recuo do sistema. O indicador de progresso continua na borda inferior. A correção do corte reportado requer confirmação no aparelho, pois o navegador local desta sessão está indisponível.
