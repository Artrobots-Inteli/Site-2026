# Experiência da liga e publicação institucional

## Problema, fontes e decisão

Projetos, competições, parcerias e calendário tinham manutenção independente no site e na ArtroLove. O pedido de 27/09/2026 estabelece a ArtroLove como fonte editorial, administrada por membros e diretoria de marketing. O visitante deve conhecer o clube, explorar suas áreas e chegar ao conteúdo publicado ou à comunidade sem navegar por uma sequência obrigatória de seções.

O usuário recusou a primeira proposta editorial com seções e fundo escuro por continuar convencional. Essa alternativa foi substituída por uma aplicação React/TypeScript: fotografia de entrada, mapa 3D em tela inteira e painéis contextuais. A homepage não possui rodapé nem rolagem linear de seções. A linguagem espacial combina a identidade visual com o modelo do robô fornecido, sem simular medições ou telemetria reais. A montagem é visual, sem alegar montagem física validada.

[Locomotive](https://locomotive.ca/en) orienta imersão, transições e atenção à composição. [Bruno Simon](https://bruno-simon.com) é referência de navegação por um ambiente 3D. Nenhum asset, texto ou modelo desses sites foi copiado. A interação oferece seis áreas: Projetos, Competições, Conhecimento, Membros, Parcerias e Calendário.

Fotografia final: arquivo profissional fornecido pelo usuário em `C:/Users/Usuario/Downloads/72888ab4-0906-42dc-94c9-b2cefad63063-_R2V7689.jpg`. O original permanece preservado. `assets/artrobots-grupo-2026.webp` normaliza orientação e compressão, com 1920 × 1280 e 373.208 bytes. O quadro mobile 3:2 preserva o grupo e a bandeira. O álbum anteriormente apresentado foi referência adicional; seus vídeos não foram convertidos nem hospedados nesta entrega. A aranha estática aprovada foi otimizada em WebP para fallback.

Robô: `assets/artrobots-robot-kaian.glb`, convertido de quatro STLs fornecidos por Kaian Moura: base, carapaça e pernas direita/esquerda. Os arquivos são exports separados para impressão, sem coordenadas de montagem comuns. `deploy/convert-kaian-robot.mjs` reconstrói a apresentação visual a partir do GIF fornecido, fixa transformações e guarda hashes/fontes no GLB. A autoria é creditada no asset. O resultado não é instrução de fabricação ou montagem; a animação é artística. Placa, circuitos, iluminação e conectores usam geometria procedural própria.

## Escopo e jornadas

O modelo fornecido por Kaian substitui a interpretação genérica como peça central. Uma única Canvas compartilhada também apresenta uma prévia discreta no portal, após carregar a fotografia, sem cobrir rostos, bandeira ou CTA. O mapa mantém as seis áreas e suas permissões. O botão de pausa está no cabeçalho, disponível desde a primeira tela. Fotos e conteúdo permanecem acessíveis mesmo sem GPU.

O refinamento final responde à rejeição do material brilhante e artificial: o robô mantém sua geometria, com casco púrpura fosco, base grafite e iluminação suave, sem emissão ou verniz espelhado. A entrada também oferece acesso direto a Projetos, Competições, Parcerias, Calendário e Membros. O mapa 3D é uma forma opcional de explorar, sem etapa obrigatória para consultar o conteúdo.

Visitante abre a foto do clube e pode acessar Projetos, Competições, Parcerias, Calendário ou Membros diretamente pela navegação da entrada. “Explorar a liga” abre o mapa opcional com seis conectores, incluindo Conhecimento. A câmera muda o foco e um painel apresenta o conteúdo da área. “Voltar à liga”, Escape e o histórico do navegador recuperam o mapa. Marca e botão “Entrada” recuperam a fotografia. Não há tutorial obrigatório, scroll controlado nem conteúdo fictício para preencher telas.

Projetos, Competições, Parcerias e Calendário consomem exclusivamente o feed público. Conhecimento oferece o acesso à documentação interna da ArtroLove, protegido pelo login da aplicação, e à organização GitHub. Membros conecta o diretório e seus perfis existentes, a comunidade e o Instagram institucional. O site não obtém documentos ou anexos internos anonimamente. As quatro páginas legadas de diretório/perfil continuam no mesmo build, sem perder identidade, permissões ou URLs.

Não objetivos: editor no site, sincronização inversa, jogo com veículo, cadastro duplicado de membros, migração completa do diretório para React nesta fatia, analytics ou métricas fictícias. A autorização editorial pertence à ArtroLove; esta especificação cobre o consumidor público.

## Requisitos e rastreabilidade

|ID|Fonte/necessidade|Comportamento esperado|Implementação|Aceite/evidência|
|---|---|---|---|---|
|LAND-01|Pedido de experiência dinâmica|Portal→hub espacial→área, seis destinos, PT/EN, retorno e links diretos|`src/LeagueApp.tsx`, `src/model.ts`|Mouse/toque/teclado, Escape/histórico; rotas legadas reconhecidas; capturas desktop/mobile|
|LAND-02|Modo noturno solicitado|Noturno, claro e sistema com preferência persistida também nas páginas legadas|`components/site-theme.js`, `identity.css`, `src/league.css`|Teste de preferência/sistema/armazenamento bloqueado; troca e recarga em navegador|
|LAND-03|Marketing controla conteúdo institucional|GET sem credenciais/no-store ao abrir, a cada 60 s enquanto visível e ao recuperar foco; sem escrita|`src/usePublicContent.ts`|Estado publicado observado após conexão; API e autorização validadas na aplicação|
|LAND-04|Retirada e publicação precisam prevalecer|Snapshot inicializado substitui o conjunto completo, inclusive vazio|`src/publicContent.ts`, hook/painel React|Teste de retirada seguida de falha ou resposta não inicializada não ressuscita itens|
|LAND-05|Falhas/cold start não podem inventar conteúdo|Primeira falha deixa conteúdo indisponível com retry; falha após sucesso mantém só o snapshot desta aba e declara desatualização|Hook e estado no painel|Sem seed/cache persistente; timeout 65 s; loading explícito para primeiro acesso; teste de falha inicial/vazio|
|LAND-06|Somente publicação pública|Textos escapados, HTTPS sem credenciais/host interno/IP; imagens apenas da rota pública ou assets institucionais|Validador público e `src/ContentPanel.tsx`|SSR React testa HTML hostil, links e anexos privados; contrato permite location até 300 caracteres|
|LAND-07|Histórico e datas corretos|Estados e destaques explícitos, horário São Paulo, dia inteiro UTC civil com fim exclusivo; imagem ausente não reserva quadro vazio|`src/model.ts`, painel React|SSR de eventos dia inteiro e horário; foto com erro desaparece, URL substituída restaura imagem|
|LAND-08|Three.js central e fluido|R3F lazy após carregar a fotografia ou explorar, uma Canvas, iluminação procedural, foco por área; agendamento até 60 fps desktop/30 fps mobile e DPR 1.5/1.15|`src/worldScene.tsx`|Renderização em navegador, pausa global/tab invisível, reduced-motion estático, fallback DOM sem WebGL|
|LAND-09|Controles acessíveis e responsivos|Nós DOM equivalentes a conectores raycast, foco ao abrir/voltar, painéis roláveis; sem transbordamento ou controles cortados|App, scene e CSS|390 × 844 e 667 × 375, teclado, painel/volta/pausa; viewport restaurado após teste|
|LAND-10|Modelo real e acabamento pedidos pelo usuário|Robô baseado nos STLs fornecidos por Kaian, montagem visual identificada, prévia no portal e movimento autônomo variado no mapa|Conversor de assets, GLB e cena R3F|Conferir origem, orientação, escala, rota não repetitiva, pausa e reduced-motion antes de publicação|

Cada linha associa fonte, necessidade, requisito, implementação e verificação. Evidências finais pertencem a `specs/evidencias-landing/`; notas operacionais e memória do agente permanecem externas. A especificação substitui critérios da proposta recusada.

## Contrato público e segurança

`GET https://artrolove.artrobots.tech/api/public/site-content` retorna `{schemaVersion:1, initialized:boolean, updatedAt:ISO|null, items:[]}`. Items têm `id`, `kind` (PROJECT/COMPETITION/PARTNERSHIP/EVENT), `title`, `summary`, `titleEn?`, `summaryEn?`, `imageUrl`, `imageAlt`, `url`, `featured`, `order`, `status` (ACTIVE/COMPLETED), `startsAt`, `endsAt`, `location`, `allDay?`.

O consumidor valida o contrato antes de atualizar, usando um módulo TypeScript importado diretamente, sem objeto global de dados. Não expõe IDs de membros, fontes privadas, cookies ou chaves. Imagens aceitas: `/api/public/site-content/photos/[id]` na origem canônica e assets já públicos em `https://artrobots.tech/assets/`. Qualquer outro endereço de imagem é omitido. Links externos HTTPS legítimos são permitidos após verificação de protocolo, credenciais e host; a publicação editorial continua sujeita à revisão no CMS.

Não há fallback estático de conteúdo institucional. O último snapshot recebido nesta aba é a única cópia mantida em memória, mesmo quando vazio. Uma primeira visita com API indisponível não republica itens antigos. Offline após sucesso mantém conteúdo explicitamente desatualizado até uma nova conexão. A atualização é unidirecional e pode levar até 60 s numa aba aberta; não é realtime.

## Arquitetura e build reproduzível

React 19.3.0 e TypeScript 5.9.3 organizam estados, rotas e painéis. Motion 13.4.4 controla transições reduzidas quando solicitado. React Three Fiber 9.8.1 integra Three.js 0.186.1 declarativamente. Vite 8.3.1/plugin-react 6.1.1 gera bundle inicial e chunk 3D separado. Todas as versões estão fixadas no package-lock; não há CDN/runtime download de código 3D. O Node de deploy/CI está fixado em 24.21.0, com engine restrito à série 24.

Referências primárias: [React](https://react.dev/reference/react), [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas), [R3F performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Motion accessibility](https://motion.dev/docs/react-accessibility), [Vite build](https://vite.dev/guide/build), [Three.js WebGLRenderer](https://threejs.org/docs/#WebGLRenderer). Essas bibliotecas já resolvem ciclo de vida, transições e renderização sem introduzir um framework de requisitos.

Comandos: `npm ci`, `npm test`, `npm run build`. O build faz typecheck, Vite e exportação das páginas legadas/arquivos institucionais em `dist`. Render mantém hospedagem estática gratuita, servindo uma aplicação dinâmica no cliente; o backend/CMS continua na ArtroLove. `render.yaml` e GitHub Actions usam o mesmo fluxo; Actions testa antes de produzir o build. Tema clássico no head é copiado ao output para aplicar a preferência antes do React, evitando flash de tema.

## Validação e limites

Testes automatizados executam o componente React real via SSR, o contrato público, rotas, datas, temas e os testes existentes do diretório. SSR não comprova WebGL, foco, GPU, movimentos ou contraste; esses pontos são verificados em navegador real. A migração não muda o backend para o site e não aumenta o plano de hospedagem.

O chunk 3D é maior que 500 KB minificado por incluir o renderer e R3F. Ele carrega depois da fotografia ou quando o visitante explora, sem bloquear os controles e o conteúdo. Limites de DPR, loop sob demanda e pausa reduzem custo de GPU. Não houve medição de Core Web Vitals ou benchmark em dispositivos físicos; FPS é limite agendado, não garantia em hardware lento. Browsers sem WebGL continuam com imagem de identidade, seis botões e todos os painéis. Áreas de documentação permanecem internas.

Build, testes, capturas e SHA de publicação devem corresponder à revisão final. A publicação integrada exige verificar feed ativo, páginas PT/EN, quatro áreas, links de membros e retorno à ArtroLove no domínio real. O ambiente anterior fica preservado até essa verificação.

Validação local: 19 testes passaram, incluindo o componente React real e os nove testes existentes do diretório. O build verifica TypeScript e produz chunks separados. A navegação direta, retorno com foco, Escape, tema/idioma e feed real foram observados no navegador. Antes da publicação, a faixa mobile curta foi corrigida para até 680 px, absorvendo arredondamento de pixels com DPR; o portal landscape usa o canto direito e portrait preserva o intervalo entre foto e texto. Capturas finais de produção e SHA serão registrados no checkpoint de publicação; rascunhos locais recusados não constituem prova da entrega.
