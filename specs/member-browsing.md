# Navegação e visualização dos membros

Pedido da vice-presidência, 01/10/2026: voltar ao site a partir dos membros, reduzir o tamanho das fichas no diretório e permitir outras visualizações; usar carrossel para a liderança na home.

## Evidência e decisão

O diretório abria os perfis públicos no domínio da ArtroLove. Seu link de retorno apontava para `/membros` da plataforma, sem navegação do site institucional. A composição única de retratos verticais obrigava o visitante a percorrer cards grandes.

O site passa a apresentar os perfis aprovados nas próprias entradas `membro.html` e `membro-en.html`, preservando links de volta ao diretório e à home. O perfil consome a mesma projeção pública validada da ArtroLove, sem consultar cadastro privado. O acesso à comunidade continua em uma ação explícita.

## Critérios de aceite

- Diretório com link explícito para a home, independente do histórico do navegador.
- Perfil dentro do site, com retornos para membros e home; URLs antigas por `siteKey` continuam resolvendo a identidade aprovada.
- Seletor Compacto/Lista/Cards acessível por teclado, com estado pressionado; padrão compacto. Preferência opcional compartilhada entre PT/EN, sem armazenar os dados de membros.
- Todos os modos mantêm as mesmas identidades, cargos e fotos aprovados. Campos privados não entram na interface. Retiradas e indisponibilidade continuam ocultando perfis, sem ressuscitar o acervo histórico no diretório ativo.
- Liderança na home em faixa horizontal com rolagem nativa, setas e teclado, sem autoplay; controles desabilitados nos limites; movimento reduzido respeitado e efeitos de cards mantidos.
- Diretório e carrossel não aumentam a largura do documento no celular; retratos grandes permanecem disponíveis no modo Cards.
- Typecheck, testes de componentes/contratos e build com seis entradas pré-renderizadas aprovados. Jornada em navegador cobre retorno, preferência e largura responsiva.

## Limites

Esta mudança não altera cargos, cadastros, permissões, classificação de liderança ou decisões de publicação. Os agrupamentos vêm do feed público aprovado. A validação técnica do layout não mede usabilidade ou retenção com pessoas.
