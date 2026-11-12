# SEO e GEO — Domus Armorum

Implementação orientada pela skill `geo-seo-claude`, com as recomendações confrontadas com a documentação oficial de Google e OpenAI. Os textos, o desenho, os vídeos e as animações do site foram preservados.

## Problemas encontrados e correções

- O HTML inicial publicado continha apenas o elemento vazio `#root`. O build agora renderiza os próprios componentes React em português e entrega o conteúdo existente no HTML, inclusive navegação, marcas, tours, história e contato. O navegador continua inicializando o mesmo aplicativo, com a seleção de idioma e os vídeos próprios de cada tela.
- `robots.txt`, `sitemap.xml` e `llms.txt` não existiam: a hospedagem retornava o HTML da página para esses caminhos. Agora são arquivos reais gerados no build.
- O JSON-LD básico da loja foi ampliado com entidades relacionadas `Store`, `WebSite`, `WebPage` e `Service`. Endereço, CNPJ, data de fundação, telefone/WhatsApp, e-mail, mapa e perfil oficial usam os dados já publicados no site.
- Canonical, URLs sociais, imagem de compartilhamento, sitemap e identificação das entidades são gerados a partir de `company.url`, em `src/company.js`, para evitar endereços divergentes.
- `llms.txt` resume os fatos publicados e aponta para as seções existentes. A exclusividade é atribuída a Ghost e Konus, a Sightron permanece como representação e a Sabatti continua omitida. Não foram criados preços, avaliações, horários, estoque ou credenciais.

## Limites e decisões

- Não há promessa de posição no Google ou indicação por uma IA. O trabalho melhora o acesso e a interpretação do conteúdo; inclusão e ordenação dependem de cada plataforma.
- `llms.txt` é um recurso complementar. Não é exigido pelo Google nem garante citações.
- Acesso para busca e autorização de treinamento de IA são controles diferentes. As preferências de robôs da conta Cloudflare não foram alteradas.
- Não foram adicionados `SearchAction`, avaliações, FAQ ou outras marcações que anunciem funções/conteúdos ausentes da página.
- O sitemap lista a página real, sem tratar âncoras como páginas independentes. `hreflang` não foi anunciado: as traduções atuais são selecionadas no navegador, e não páginas traduzidas distintas servidas no primeiro HTML.
- Não foram alterados DNS, domínios personalizados, Search Console, Bing Webmaster Tools ou cadastros externos. O domínio `domusarmas.com.br` não resolvia durante esta implementação; o endereço principal permanece `https://domus-armorum.pages.dev/`.

## Após ativar o domínio próprio

Concluir manualmente o domínio personalizado no projeto Cloudflare Pages. Quando ele estiver funcionando, atualizar `company.url` em `src/company.js` e publicar novamente: o build atualiza canonical, Open Graph, dados estruturados, sitemap e `llms.txt` juntos. Cadastrar o sitemap do domínio final no Google Search Console e no Bing Webmaster Tools. Manter o endereço e o contato coerentes com o perfil oficial da empresa no Google.

## Validação técnica

Build com pré-renderização concluído. Conferência estática do HTML e dos arquivos gerados, incluindo JSON-LD, dados de contato, presença das 12 marcas e ausência de Sabatti. Não foram atribuídas notas de ranking, Core Web Vitals ou visibilidade em IA sem dados reais. A conferência visual permanece com o responsável pelo site.

## Referências

- Skill utilizada: https://github.com/zubair-trabzada/geo-seo-claude
- Google: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google e busca generativa: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google e dados estruturados: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Rastreamento de busca e treinamento: https://developers.openai.com/api/docs/bots
