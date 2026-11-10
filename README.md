# Domus Armorum

Site institucional em italiano, inglês, espanhol e português, feito com React, Vite, Three.js, GSAP e Lenis. Apresenta a identidade da Domus Armorum, a loja em Cascavel e os tours na Itália, com cursos e treinamentos, visitas a fábricas, gastronomia e cultura.

A identidade visual utiliza grafite, oliva e latão, tipografia editorial e uma textura discreta. O hero seleciona duas versões fornecidas pelo responsável: VID_20261110090107.mp4 para celular (720×1280, otimizado para 2,23 MB) e DOMUS_ARMORUM_hero_desktop_original_nitido-1~2.mp4 para desktop (1624×914, 5,56 MB). Ambas têm cerca de 9 segundos e 24 fps. A versão desktop conserva integralmente o fluxo H.264 original, sem recompressão: somente áudio e metadados foram retirados e faststart aplicado. Os hashes do fluxo de vídeo de entrada e saída foram comparados e são iguais. A reprodução ocorre uma vez e conserva o quadro final. No celular em retrato, vídeo e imagem de capa preenchem toda a área do hero com object-fit: cover, sem espaço reservado acima ou abaixo. No desktop, object-fit: contain conserva a animação inteira. Os arquivos v2 do celular permanecem inalterados; os arquivos desktop-v1 têm URLs próprias. A seleção acompanha o breakpoint de 768 px, com uma única versão de vídeo carregada inicialmente. Imagens de capa e preloads seguem o mesmo breakpoint. A troca de largura preserva o progresso, a pausa manual e o estado final, sem reiniciar um vídeo já concluído. Uma sombra discreta no celular mantém os controles legíveis. O menu fica disponível na abertura e o cabeçalho completo aparece ao passar pelo hero. O código da antiga cena Three.js está preservado, mas não é importado nem baixado pela abertura atual.

A loja e as conexões na Itália têm seções próprias e acessos equivalentes. O conteúdo internacional se baseia nas conversas fornecidas pelo responsável, com apresentação clara dos tours na Itália, cursos e treinamentos esportivos, visitas a fábricas de armas e munições, parceiros locais, gastronomia e cultura. Não são anunciados pacotes, valores, datas, parceiros identificados ou disponibilidade. A matriz foi confirmada pelo proprietário: Rua Souza Naves, 3983, sala 605, Centro, Cascavel–PR, CEP 85810-070. Telefone institucional (45) 99937-9300 e e-mail domusarmorum@gmail.com; o WhatsApp existente (45) 99979-4330 continua identificado separadamente. As fotografias são ilustrativas.

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
- Reformulação 3D publicada em produção em 09/11/2026; branch de trabalho: `codex/domus-identidade-3d`.
- Barra de revisão da Vercel desativada nesta branch com `VERCEL_PREVIEW_FEEDBACK_ENABLED=0`, configurada no ambiente Preview da Vercel.
- Link principal para acesso e próximas atualizações: https://domus-armorum.vercel.app/ . A branch `main` publica nesse mesmo endereço. Links de preview são auxiliares e não substituem o link principal.
- Painel Vercel: https://vercel.com/jonas-jr/domus-armorum
- URL de produção: https://domus-armorum.vercel.app/
- Publicação contínua pela integração GitHub–Vercel: commit e push em `main`, seguidos da verificação do status do deploy e da URL pública. Reutilizar as conexões existentes.

## Conteúdo e imagens

- Logo original: material enviado pelo responsável no chat em 03/11/2026. O recorte desfocado do print foi retirado da página e da pasta pública.
- Foto de armas e equipamentos em uma bancada: [Kaboompics / Pexels, 5202438](https://www.pexels.com/photo/weapons-on-a-table-5202438/). Foto real, redimensionada em WebP. Licença Pexels, sem obrigação de crédito visual na página.
- Foto de munições: [Pexels, 6091294](https://www.pexels.com/photo/a-row-of-bullets-6091294/). Foto real, redimensionada em WebP. Licença Pexels, sem obrigação de crédito visual na página.
- Foto de equipamentos táticos: Dan Galvani Sommavilla / [Pexels, 7393146](https://www.pexels.com/photo/backpack-with-gloves-on-wall-7393146/). Composição real com mochila, luvas, óculos e acessórios; otimizada em WebP, sem geração de imagem. Licença Pexels, sem crédito visual obrigatório. Substitui a foto de proteção na bancada rejeitada pelo responsável.
- Fotografias das experiências: paisagem italiana e homem com fuzil e proteção auditiva/ocular são imagens ilustrativas de Unsplash/Pexels. Gastronomia usa a fotografia da mesa com café (1002532331.jpg) enviada pelo responsável em 10/11/2026, identificada como acervo Domus Armorum. A imagem anterior de pratos de uma osteria em Roma foi substituída. Arquivos locais em public/experiences/, com fontes em NOTICE.txt. O recorte da mesa prioriza a xícara e mantém as cores da fotografia. A imagem ocupa a composição vertical já existente, com texto ao lado e adaptação ao celular.
- As fotos são ilustrativas e não representam a estrutura, o estoque ou a equipe da empresa.
- A logo original recebida permanece em `public/brand/original-enviado.jpg`. As versões WebP são otimizações da mesma marca.
- WhatsApp flutuante: símbolo original em SVG local, com proporção preservada e sem o ícone Phosphor. Fonte em `public/brand/NOTICE.txt`.
- Instagram: https://www.instagram.com/domus.armorum/
- WhatsApp completo extraído do link no print: https://wa.me/5545999794330. O número digitado no chat, `(45) 9979-4330`, possui um dígito a menos; a confirmação foi solicitada.
- Localização confirmada pelo responsável em 06/11/2026: Cascavel, Paraná, Brasil. O endereço italiano informado anteriormente foi corrigido e retirado da página. O endereço completo e os horários devem ser consultados pelo canal de contato até serem confirmados. Razão social e CNPJ brasileiros foram restaurados conforme os dados já existentes no projeto: AWM Armas e Munições LTDA, 28.698.049/0001-89.
- Fontes Barlow Condensed e Manrope hospedadas localmente com Fontsource; ícones Phosphor.

## Acessibilidade e movimento

Movimentos de rolagem contínuos e reversíveis, sem reiniciar opacidade. Respeita `prefers-reduced-motion`, mantém links nativos, navegação por teclado e indicação imediata ao acionar WhatsApp. O estado é restaurado ao retornar à página. O vídeo de abertura usa autoplay, muted e playsinline; o controlador define muted/defaultMuted antes de play(). A imagem do quadro final e o comando de reprodução ficam disponíveis quando autoplay é bloqueado ou o carregamento do MP4 falha. Com movimento reduzido ou economia de dados, a imagem estática aparece sem baixar o filme; o visitante pode iniciar a reprodução. O vídeo pausa fora da tela ou em aba oculta, retoma quando apropriado e não reinicia depois do final. Há controle de pausa e repetição. A seta permanece disponível desde o início e se move apenas três vezes. Restrições do aparelho, como economia de energia no iPhone, podem impedir autoplay.

## Verificação

```sh
npm run dev
npm run test:browser
```

Os testes usam Playwright para desktop/celular, os quatro idiomas, temas, menu, rolagem, imagens e feedback do WhatsApp. `node scripts/check-hero.mjs` cobre autoplay silencioso inline, pausa e repetição, preservação do quadro final ao rolar, cabeçalho e menu, falha de carregamento, bloqueio de autoplay e movimento reduzido sem download do MP4. `test:motion` e `test:handoff` executam a mesma verificação para manter os comandos anteriores. Use TEST_BROWSER_CHANNEL=msedge para Edge ou TEST_ENGINE=webkit para o motor WebKit instalado pelo Playwright. WebKit de teste não substitui a validação em um iPhone físico. Os artefatos ficam em artifacts/ (não versionados).

## Prévia de compartilhamento

Capa própria com emblema original e tipografia do site, em JPEG 1200 × 630. Open Graph e Twitter Card são entregues no HTML inicial, com URL absoluta de produção e nome de arquivo versionado por conteúdo. Para gerar novamente: `node scripts/prepare-social.mjs`. A exibição e a atualização de prévias já armazenadas dependem do aplicativo de compartilhamento.

## Idiomas

Italiano, inglês, espanhol e português, com seletor nativo ao lado do tema. A seleção inicial segue esta ordem: idioma válido no parâmetro `?lang=it|en|es|pt`, escolha manual salva no navegador, primeiro idioma compatível da lista de preferências do navegador e italiano como padrão quando não houver correspondência. Não há solicitação de localização nem consulta externa por IP. Somente escolhas manuais ficam salvas; parâmetros e âncoras do link são preservados. Textos, rótulos acessíveis, descrições das imagens, título, descrição e feedback do WhatsApp acompanham o idioma. A troca atualiza o ScrollTrigger sem reiniciar as animações. A prévia social no HTML inicial e a capa de compartilhamento usam italiano e a localização em Cascavel, Paraná, Brasil. O crédito “Desenvolvido por Jonas Jr” permanece visível com o link do autor.

Verificação da resolução de idiomas e integridade das traduções: `npm run test:languages`. O teste de navegador também cobre os quatro idiomas em desktop e celular, persistência, precedência da URL, navegação pelo histórico, armazenamento indisponível, localização em Cascavel e dados da empresa.

## Conexão Brasil–Itália

Cartografia ortográfica com geografia real do Natural Earth, de domínio público. Brasil e Itália são destacados, com marcador em Cascavel e um ponto representativo do país de destino. O arco é uma conexão visual ilustrativa; não é uma rota aérea, programação ou endereço de parceiro.

Uma timeline GSAP acompanha a rolagem: origem, desenho gradual do arco, deslocamento do ponto de luz e chegada ao destino. A roda do mouse e o toque mantêm o comportamento nativo em toda a página; Lenis anima apenas a navegação por links internos. A rota usa `scrub: true`, sem atraso adicional, sem fixar ou segurar o globo, e interpola pontos pré-calculados sem consultar a geometria SVG a cada frame. A cartografia e o texto não se deslocam durante a animação. `npm run test:scroll` verifica entradas iguais da roda antes, durante e depois do mapa, sem cancelamento do evento, e a chegada imediata ao destino. A rota chega à Itália enquanto o globo inteiro ainda está visível; o intervalo de rolagem foi encurtado para concluir antes de sair da seção. O movimento reverte ao subir e não usa loops. Com movimento reduzido, o mapa aparece completo e estático. Textos e descrição acessível estão nos quatro idiomas.

Os caminhos são preparados com `npm run prepare:map` e versionados em `src/data/journey-map.json`; `d3-geo` é usado somente na preparação, sem biblioteca de mapas ou requisições externas durante a visita. Fonte e licença estão no JSON. Verificação específica: `npm run test:journey`.

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

## Representações e acervo institucional

Ghost Holster e Konus Optics têm representação exclusiva no Brasil conforme informação direta do proprietário. Sightron é apresentada como representação, sem exclusividade. O localizador oficial da Ghost (https://ghostinternational.com/dealers/) incorpora um mapa público cujos dados listam Domus Armorum, Rua Souza Naves 3983, Cascavel.

A apresentação das marcas mantém Ghost, Konus e Sightron em composições próprias. As nove marcas de distribuição aparecem uma vez, com suas logos, em três grupos: munições e componentes; indústria brasileira; limpeza e coldres. As listas duplicadas e o carrossel foram removidos. Logos originais, proporções e cores preservados; fontes em public/partners/sources.json e NOTICE.txt.

O acervo em src/data/partners.js publica três fotografias fornecidas em 10/11/2026: visita às instalações Ghost, detalhe de acessórios e registro do grupo diante do painel Ghost. A foto do escritório foi retirada a pedido do responsável e aguarda confirmação do proprietário; seu registro está com image: null e o WebP foi removido dos arquivos públicos. A visita aparece ampla à direita com um detalhe vertical menor; o registro do grupo aparece amplo à esquerda com o texto do acervo à direita. A Konus mantém sua imagem institucional de binóculos, e a composição Ghost mantém também a foto institucional de coldre. O bloco Na Itália, de perto pertence à seção #italia, após os conteúdos dos tours. Fotografias com suas proporções completas e cores naturais, sem corte de rostos ou redesenho das marcas. A proporção explícita de cada imagem reserva seu espaço antes do carregamento e evita deslocar o globo ou invalidar os pontos da animação de rolagem. O teste partners retarda os arquivos para verificar que a posição do mapa permanece estável. As entradas usam o movimento discreto data-reveal já existente e respeitam movimento reduzido. O registro de feira permanece vazio e omitido; as fotografias não atribuem nomes às pessoas. Fontes em public/experiences/NOTICE.txt. A imagem do homem diante do monitor não é usada como registro documental. As fotos de produtos de munições e rifles não integram esta composição institucional.

Os dados públicos da matriz estão centralizados em src/company.js; o JSON-LD Store é entregue no HTML inicial (index.html). Ao alterar endereço/telefone, atualizar também esse JSON-LD. Não são publicados horários ou coordenadas não confirmados.

Verificação das relações institucionais, logos agrupadas sem duplicação e dados de contato/JSON-LD: `npm run test:partners`.

## Responsividade

`npm run test:responsive` verifica 56 combinações: quatro idiomas e 14 larguras entre 320 e 2560 px, além de menus em retrato (320×568) e paisagem (844×390). A checagem inclui texto ultrapassando o próprio bloco, sobreposições, controles de toque com área mínima de 44 px e links do rodapé livres do WhatsApp flutuante. A imagem panorâmica Konus conserva seu enquadramento; o rodapé reserva o espaço do botão flutuante nas larguras em que os créditos ficam à direita. Regras transversais em src/responsive.css.

A seção genérica de armas, munições e equipamentos foi retirada para priorizar as marcas. A navegação e os atalhos levam diretamente às marcas e aos tours. O identificador antigo #atuacao permanece como alias de localização para links anteriores.


## Acabamento das interações

Revisão com os playbooks polish e animate do Impeccable oficial (pbakaus/impeccable, skill 4.8.2), preservando a identidade existente. A seta fica próxima da borda inferior, sem círculo, com área de toque de 44 px e indicação curta na entrada e no final do filme. Menu com entrada/saída reversíveis em CSS, pequeno encadeamento entre os links e ícone que se transforma em X. O menu fechado usa inert, leva o foco ao primeiro link quando abre e fecha por Escape, foco externo ou clique fora. As transições de pressão e hover mantêm o desenho original dos controles e do WhatsApp. Movimento reduzido mantém o estado legível sem deslocamentos.

`npm run test:interactions` verifica mouse, teclado, fechamento, alternância rápida, alvo da seta, pressão e movimento reduzido em celular e desktop. TEST_ENGINE=webkit seleciona WebKit, e TEST_BROWSER_CHANNEL=msedge usa Edge. O detector Impeccable foi executado uma vez nos três arquivos de interface alterados e retornou uma lista vazia de achados.

`npm run test:hero-sources` verifica a seleção de mídia entre 390 e 2560 px, ausência de download de MP4 com movimento reduzido, ausência de download duplo na entrada, dimensões/proporções do vídeo, troca de largura, preservação de pausa e quadro final e repetição explícita. TEST_ENGINE=webkit também é aceito.
