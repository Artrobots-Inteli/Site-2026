# Migração React e TypeScript

## Escopo e resultado local

As seis páginas PT/EN foram refatoradas para componentes React/TSX, mantendo o design e os endereços publicados. Base visual: `12b5ac6`; base Git: `b1357b7`. O conteúdo institucional é pré-renderizado e hidratado; membros e marketing são atualizados pelas APIs públicas da ArtroLove.

## Evidências reproduzíveis

| Verificação | Resultado |
| --- | --- |
| `npm test` | 40 testes, seis arquivos, aprovados |
| `npm run typecheck` | Aprovado |
| `npm run build` | Seis páginas pré-renderizadas; artefato público verificado |
| `npm audit --omit=dev` | Zero vulnerabilidades |
| API real de marketing | HTTP 200, 11 itens: quatro projetos, duas competições, três parcerias e dois eventos |
| API real de membros | HTTP 200, zero perfis aprovados; preservados 27 membros do acervo público legado |
| Navegador desktop | Home e diretório PT/EN; perfis individuais e troca de idioma preservando identidade; sem erros de hidratação, imagens quebradas ou transbordamento horizontal |
| Interações | Flip card por Enter/Escape com retorno de foco, carrossel, oito cards de liderança com brilho, seis canvases, menu móvel e fechamento por Escape |
| Celular | Diretório em 390 × 844, 27 cards e sem transbordamento horizontal |

Build validado: JS 345,43 kB (105,27 kB gzip), CSS 48,36 kB (10,44 kB gzip). As bibliotecas Canvas/WebGL continuam em JavaScript com interface tipada e ciclo de vida React; não são declaradas como uma reescrita integral em TypeScript.

## Comparação visual

Capturas reais do navegador no mesmo tamanho. Antes: domínio publicado. Depois: build de produção React local em `127.0.0.1:3123`. Não são montagens nem evidência de deploy.

| Antes | Depois |
| --- | --- |
| ![Diretório anterior](membros-mobile-antes.png) | ![Diretório React](membros-mobile-depois.png) |

## Limites e próxima integração

O cadastro importado da planilha permanece privado. A API pública atual só retorna perfis revisados. A ponte por ID estável entre cadastro e perfil público, com seleção e aprovação de campos, depende do checkpoint do backend. Testes sintéticos de projetos, retirada e permissões não equivalem à aprovação institucional de pessoas reais. Esta entrega não publica linhas da planilha automaticamente.

O formulário de contato não possuía serviço de envio na versão anterior. A refatoração informa esse estado e direciona aos contatos existentes; não simula envio bem-sucedido.

Deploy e CI do SHA publicado devem ser associados ao PR; não inferir produção apenas a partir destes testes locais.
