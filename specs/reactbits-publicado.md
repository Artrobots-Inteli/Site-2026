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

O controle "Pausar efeitos" respeita a preferência nesta aba; a preferência de movimento reduzido do sistema também mantém conteúdo e controles acessíveis. As capturas comparativas e os identificadores de publicação serão registrados após a validação do ambiente publicado.
