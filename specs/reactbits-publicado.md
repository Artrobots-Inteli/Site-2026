# Efeitos sobre o site publicado

Pedido de 27/09/2026: aplicar React Bits sobre a landing publicada e registrar antes/depois. Base `027a483`, equivalente à landing restaurada; textos, seções, fotos, idiomas e links foram preservados.

| Referência | Aplicação | Verificação |
|---|---|---|
| TechText | Nome ARTROBOTS na abertura | Canvas sobre heading textual, fallback sem movimento |
| FlipCard | Quatro projetos em destaque | Botão, teclado, Escape e gesto horizontal; verso inerte quando fechado |
| GlowCursor | Ponteiro fino | Shader original adaptado, sem interceptar cliques, pausa em aba oculta |
| GradientWaves | Abertura | Shader original adaptado, resolução limitada, fundo CSS se WebGL falhar |
| DotField | Abertura do site e diretório | Pontos reagem e retornam à origem; versão estática com movimento reduzido |
| ProfileCard | Liderança e membros | Inclinação e camadas holográficas; conteúdo e links aprovados preservados |
| SpecularButton | Dois CTAs principais | Shader original; acabamento CSS nos botões secundários e como fallback |
| ScrollReveal | Títulos e textos introdutórios | Palavras reveladas pela rolagem; carrossel atualiza a divisão do texto |
| BranchedMenu | Documentação ArtroLove | Implementação no repositório privado Artrobots-Inteli/artrolove |

Fontes oficiais: [React Bits](https://www.reactbits.dev/get-started/index), revisão `5d0c00e7594c898e989b250d022806961f4c8478`. Adaptação para HTML/JavaScript do site. Licença e diferenças em `THIRD_PARTY_NOTICES.md`.

Hipótese: aplicar os efeitos nos elementos existentes melhora a expressividade sem romper navegação, leitura e diretório. Aceite: todas as referências rastreáveis, nenhum overflow na largura de 390 px, ações por teclado, conteúdo legível sem animação e perfis restritos ao contrato público existente.

Validação local: nove testes do diretório, sintaxe JavaScript e build estático aprovados. Navegador Edge: seis canvases na abertura, sem erro JavaScript; quatro flip cards; Escape fecha e devolve foco ao botão. Layout em 1440 e 390 px sem overflow horizontal. O aviso de Tailwind CDN já existia na base e não faz parte desta alteração.

O controle "Pausar efeitos" respeita a preferência nesta aba; a preferência de movimento reduzido do sistema também mantém conteúdo e controles acessíveis.

## Publicação confirmada em 27/09/2026

- Versão publicada: `12b5ac60b15fdd3a56d5f5467aa40e0e24338433`, [PR 2](https://github.com/Artrobots-Inteli/Site-2026/pull/2).
- [CI no commit final](https://github.com/Artrobots-Inteli/Site-2026/actions/runs/36308233695): 36 testes e build estático aprovados.
- [Deploy Render](https://dashboard.render.com/static/srv-das2cnojo6nc739uabeg/deploys/dep-dasdqb17lnhs738ou020): sucesso em 17,1 segundos.
- Produção PT/EN: quatro seções conectadas ao CMS público, com 4 projetos, 2 competições, 3 parceiros e 2 eventos. Oito imagens conferidas. Atualização a cada 60 segundos, ao retornar à aba e com preservação de foco/card aberto; sucesso vazio e retirada não recuperam conteúdo antigo.
- Edge em desktop/celular: nenhum overflow horizontal, nenhum erro novo de console, FlipCard abre por clique/toque e Escape devolve o foco. O botão de pausa foi validado.
- [Capturas públicas de antes e depois](evidence/reactbits-2026-09-27/README.md). A página completa foi capturada com os efeitos pausados para manter os textos fora da viewport legíveis; capturas de abertura e cards mostram efeitos ativos.

Os números da validação local acima representam o primeiro checkpoint; os 36 testes incluem a integração final do CMS. Os PRs permanecem abertos para revisão. Commits posteriores a esta versão apenas registram evidências, sem alterar o pacote publicado.
