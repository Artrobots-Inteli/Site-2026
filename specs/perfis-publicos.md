# Diretório de membros conectado à ArtroLove

Fonte: pedido da gestão em 17/09/2026. Um membro aceito aparece no site com foto, nome público, cargo e descrição previamente aprovados pela diretoria. Presidente e vice nomeiam diretores na ArtroLove; ADMIN técnico não equivale a diretor.

Fonte oficial dos perfis novos: snapshot aprovado no banco da ArtroLove. Este site estático só lê `GET /api/public/members` e as fotos públicas desse feed. Não usa cookies, tokens, email ou APIs internas. A configuração `artrolove-public-origin` aponta para a origem HTTPS da aplicação publicada.

Fluxo: a cada carregamento das páginas pt/en de membros, buscar feed sem cache; renderizar nome/cargo/descrição como texto, com foto aprovada. Falha de rede exibe aviso e permite nova tentativa. Nenhuma alteração é enviada pelo site. Remoção de membro ou retirada de publicação elimina o perfil do feed; visitantes que já carregaram uma imagem podem mantê-la até recarregar.

Conteúdo legado: os cards já existentes permanecem durante transição, sem importação automática como aprovados. Perfis conectados aparecem em seção identificada. Duplicatas existentes devem ser reconciliadas por referência explícita antes de substituir os cards antigos; o código não identifica pessoas por nomes parecidos.

Aceite PUB-05: nome com HTML é texto literal; URL de foto só pode ser o caminho público previsto no mesmo host da ArtroLove; feed inválido não substitui conteúdo legado; pt/en funcionam; configuração vazia não inventa domínio. Em localhost, a prévia usa explicitamente ArtroLove local na porta 3107. Produção exige configurar origem real antes de ativar.

Contrato detalhado e testes de aprovação/permissões vivem no repositório Artrobots-Inteli/artrolove, specs/001-conhecimento/public-profiles.md. Dados reais exigem decisão da diretoria, não aprovação do agente.
