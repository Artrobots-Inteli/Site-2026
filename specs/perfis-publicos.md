# Diretório de membros conectado à ArtroLove

Fonte: pedido da gestão em 17/09/2026. Um membro aceito aparece no site com foto, nome público, cargo e descrição previamente aprovados pela diretoria. Presidente e vice nomeiam diretores na ArtroLove; ADMIN técnico não equivale a diretor.

Fonte oficial dos perfis novos: snapshot aprovado no banco da ArtroLove. Este site estático só lê `GET /api/public/members` e as fotos públicas desse feed. Não usa cookies, tokens, email ou APIs internas. A configuração `artrolove-public-origin` aponta para a origem HTTPS da aplicação publicada.

Fluxo: a cada carregamento das páginas pt/en de membros, buscar feed sem cache; renderizar nome/cargo/descrição como texto, com foto aprovada. Falha de rede exibe aviso e permite nova tentativa. Nenhuma alteração é enviada pelo site. Remoção de membro ou retirada de publicação elimina o perfil do feed; visitantes que já carregaram uma imagem podem mantê-la até recarregar.

Conteúdo legado: os 27 cards já públicos recebem chaves estáveis, iguais nos dois idiomas, e apontam para `membro.html?perfil=<chave>` ou `membro-en.html?perfil=<chave>`. Essas páginas leem os campos já públicos do diretório do mesmo idioma, sem manter uma segunda ficha nem criar contas. A associação a uma conta ocorre explicitamente na revisão da diretoria na ArtroLove, por `siteKey`, nunca por semelhança de nomes. Havendo associação, o perfil público da ArtroLove passa a ser o destino canônico e os cards legados correspondentes deixam de ser mostrados.

## Diretório integrado (PUB-06)

Fonte: pedido da gestão em 17/09/2026 para manter o padrão visual da página, colocar membros sem projeto ativo por último e conectar todos os perfis.

Contrato: `GET /api/public/members` entrega `{ members: [{ id, name, position, description, photoPath, profilePath, siteKey, directoryGroup }], linkedSiteKeys }`. `profilePath` deve ser exatamente `/membros/<id>`; `photoPath`, `/api/public/members/<id>/photo`. `siteKey` é uma chave pública explícita ou `null`. `directoryGroup` aceita `leadership`, `projects` ou `community`, calculados pelo backend a partir da diretoria vigente e participação ativa. O site não recebe nomes nem IDs de projetos internos. `linkedSiteKeys` inclui vínculos cuja publicação foi retirada, impedindo que um card legado reapareça como substituto de um perfil retirado.

Ordem: diretoria vigente conectada, diretoria e equipes já publicadas, membros conectados com projeto ativo, projetos já publicados, comunidade sem projeto ativo por último. Uma pessoa pode ter história de projetos encerrados e continuar no último grupo. A ausência de alocação não muda seu acesso à comunidade. Grupos vazios não aparecem. Fotos de 96px, gradiente, bordas, tipografia e cabeçalhos seguem os cards existentes. O site mantém a classificação histórica dos cards ainda não associados, sem inventar a alocação atual dessas pessoas.

Permissões: apenas o snapshot público aprovado e a classificação pública mínima chegam ao site. Não expor email, conta interna, projetos privados ou uma ficha em revisão. Todos os links aprovados usam a origem HTTPS configurada; todo texto passa por `textContent`. Origem ausente mantém somente os perfis legados públicos. Falha ao consultar uma origem configurada na página individual não autoriza fallback, pois não seria possível verificar uma eventual retirada. No diretório, falha preserva o HTML já público, sem criar ou modificar vínculos; um reload sem rede não consegue conhecer retiradas posteriores.

Aceite verificável:

- PUB-06.1: cada um dos 27 cards tem chave estável, foto/nome ligados ao perfil e a mesma identidade em PT/EN.
- PUB-06.2: pessoa aprovada e associada aparece uma única vez no grupo indicado pelo feed; comunidade fica depois de todos os projetos.
- PUB-06.3: `linkedSiteKeys` sem perfil publicado oculta todas as ocorrências legadas; página individual informa indisponibilidade sem foto/ficha antiga.
- PUB-06.4: página legada sem vínculo usa somente os campos da chave exata do diretório; não cria conta nem sugere acesso existente à ArtroLove.
- PUB-06.5: página legada com vínculo aprovado redireciona ao mesmo `profilePath` do card conectado; chave inexistente mostra estado explícito.
- PUB-06.6: feed inválido, caminho externo, ID repetido ou chave ambígua são rejeitados antes de modificar cards; rede indisponível oferece nova tentativa.
- PUB-06.7: versão inglesa preserva a chave ao trocar idioma e acrescenta `?lang=en` ao destino canônico; chaves possuem até 80 caracteres; fotos possuem alternativa e links são acessíveis por teclado.

Rastreabilidade: pedido → PUB-06 → `components/public-members.js`, `components/member-directory.js`, `components/member-profile.js`, `membros*.html`, `membro*.html` → `tests/member-directory.test.cjs` e validação visual de integração. Testes Node usam apenas biblioteca padrão e não substituem a verificação final no navegador.

Aceite PUB-05: nome com HTML é texto literal; URL de foto só pode ser o caminho público previsto no mesmo host da ArtroLove; feed inválido não substitui conteúdo legado; pt/en funcionam; configuração vazia não inventa domínio. Em localhost, a prévia usa explicitamente ArtroLove local na porta 3107. Produção exige configurar origem real antes de ativar.

Contrato detalhado e testes de aprovação/permissões vivem no repositório Artrobots-Inteli/artrolove, specs/001-conhecimento/public-profiles.md. Dados reais exigem decisão da diretoria, não aprovação do agente.
