# Domus Armorum

Site institucional em italiano, inglês, espanhol e português, feito com React, Vite, Three.js, GSAP e Lenis. Apresenta a identidade da Domus Armorum, a loja em Cascavel e os tours na Itália, com cursos e treinamentos, visitas a fábricas, gastronomia e cultura.

A identidade visual utiliza grafite, oliva e latão, tipografia editorial e uma textura discreta. A face da cena 3D usa os pixels do emblema original, preservando o desenho e os espaços positivos e negativos. O contorno da base é extraído da própria imagem, com espessura e chanfro discretos; a face mantém as cores originais sem alteração pela iluminação; a espessura recebe iluminação própria. Materiais, luzes, perspectiva e movimento são renderizados com Three.js, sem imagem gerada ou alteração do arquivo original. Uma única pose controla a imagem inicial e o modelo: a passagem para o WebGL preserva tamanho, posição e desenho. Na entrada, o emblema completa um giro de 2,25 segundos e termina de frente; a chegada do WebGL continua a mesma animação, sem reiniciá-la. Na rolagem, inclina-se e recua em profundidade, mantendo o centro horizontal, sem deslocamento lateral. O mouse produz uma inclinação discreta. Com movimento reduzido, a marca permanece estática. O toque não produz inclinação de mouse. A cena é pré-compilada antes de aparecer e o render não usa o antigo limitador que reduzia telas de 60 Hz para 30 quadros/s. A base aproximada e os contornos decorativos adicionais foram removidos após a revisão de fidelidade; o fallback usa a mesma imagem original com recorte do contorno extraído por `scripts/prepare-brand-outline.mjs`. A cena é carregada separadamente e só renderiza quando está visível.

A loja e as conexões na Itália têm seções próprias e acessos equivalentes. O conteúdo internacional se baseia nas conversas fornecidas pelo responsável, com apresentação clara dos tours na Itália, cursos e treinamentos esportivos, visitas a fábricas de armas e munições, parceiros locais, gastronomia e cultura. Não são anunciados pacotes, valores, datas, parceiros identificados ou disponibilidade. Endereço completo não é publicado. As fotografias são ilustrativas.

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
- Fotografias das experiências: paisagem italiana, homem com fuzil e proteção auditiva/ocular e pratos de uma osteria em Roma. Arquivos locais em `public/experiences/`, com fontes, autores e licenças Unsplash/Pexels em `NOTICE.txt`. São imagens ilustrativas, sem apresentar participantes ou parceiros como clientes da Domus. A loja usa três composições editoriais: armas em imagem ampla à esquerda, munições em contraponto à direita e equipamentos em recorte vertical deslocado. A foto de treinamento alcança a borda direita; a gastronomia ocupa um recorte vertical deslocado à esquerda, com texto ao lado. A composição se adapta ao celular sem criar rolagem horizontal.
- As fotos são ilustrativas e não representam a estrutura, o estoque ou a equipe da empresa.
- A logo original recebida permanece em `public/brand/original-enviado.jpg`. As versões WebP são otimizações da mesma marca.
- WhatsApp flutuante: símbolo original em SVG local, com proporção preservada e sem o ícone Phosphor. Fonte em `public/brand/NOTICE.txt`.
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

Os testes usam Playwright para desktop/celular, os quatro idiomas, temas, menu, rolagem, imagens e feedback do WhatsApp. O teste de entrada retarda o carregamento do 3D e compara os limites visuais antes e depois, além de verificar o giro único de entrada, a inclinação com profundidade sem deslocamento lateral, o retorno e a proporção do símbolo original do WhatsApp. A verificação de movimento cobre a cena WebGL, resposta visual ao ponteiro, rolagem nativa e âncoras Lenis, cabeçalho fixo, mudanças dinâmicas de movimento reduzido, descarte do canvas e fallback sem GPU ou com perda de contexto. Use `TEST_BROWSER_CHANNEL=msedge` para testar com o Edge instalado, ou instale Chromium com Playwright. Os artefatos ficam em `artifacts/` (não versionados).

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
