# React, TypeScript e cadastro de membros

## Decisão e escopo

Pedido de 27/09/2026: a página de membros deve consumir o cadastro gerenciado na ArtroLove, enquanto o outro agente implementa a ingestão da planilha. O site inteiro deve migrar para React com TypeScript sem alteração de design.

Base visual: `b1357b7`, código publicado `12b5ac6`. A refatoração preserva identidade, CSS, efeitos, conteúdo institucional, idiomas e endereços `.html`. React passa a controlar navegação, páginas e dados. Vite compila e agrupa os recursos para o serviço estático existente no Render. Não há serviço pago novo nem duplicação do banco no site.

Referências técnicas: [React](https://react.dev/learn/build-a-react-app-from-scratch), [Vite](https://vite.dev/guide/build.html). O site depende de APIs públicas já existentes, não precisa de um servidor Next adicional. O CSS continua necessário; será compilado localmente com as mesmas classes, sem Tailwind executado por CDN.

## Requisitos verificáveis

| ID | Comportamento esperado | Verificação |
| --- | --- | --- |
| REACT-01 | Home, diretório e perfil, PT/EN, renderizados por componentes React/TSX; sem HTML bruto injetado para simular a migração | Typecheck, build e inspeção das seis rotas |
| REACT-02 | Preservar layout, cores, imagens, navegação móvel, efeitos, redução de movimento e links atuais | Comparativo no navegador, desktop/celular |
| REACT-03 | Dependências versionadas, build reproduzível e artefato público sem specs, testes, planilhas ou credenciais | CI, inspeção de dist, audit |
| MEM-01 | Consumir somente contrato público aprovado da ArtroLove; nunca importar planilha privada no navegador | Testes de DTO, chamadas anônimas sem cookies |
| MEM-02 | Registros, cargos e fotos não se tornam públicos apenas pela importação; aprovação continua no backend | Contrato acordado com ingestão e testes de filtragem |
| MEM-03 | Perfis canônicos, relações de projetos/histórico explícitas, sem inferir identidade pelo nome | Fixtures e navegação real |
| MEM-04 | Loading, vazio, indisponibilidade, nova tentativa e retirada; atualizar dados ao voltar à página e periodicamente | Testes de transição e navegador |
| MEM-05 | Preservar o padrão dos cards; comunidade sem projeto ativo ao final; histórico identificado sem confundir cargo vigente | Fixtures PT/EN |
| MEM-06 | Exibir o retrato público aprovado em proporção vertical e em cor no card, sem reduzir a foto a um avatar de 96 px nem ampliar uma miniatura; hover/foco acrescentam destaque, mantendo nome/cargo legíveis, link, teclado e movimento reduzido | Dimensões da resposta pública, inspeção desktop/celular e testes do diretório |
| MEM-07 | Na seção de liderança já validada, ordenar presidente, vices e diretores, sem inferir mandato a partir do texto da planilha | Fixture com feed fora de ordem e checagem da DOM |
| MEM-08 | A liderança da página inicial consumir o mesmo feed aprovado do diretório, sem cards ou afirmações de cargo fixos que sobrevivam à mudança de gestão; falha da API não ressuscita dirigentes antigos | Fixture PT/EN com líder aprovado, título comunitário e indisponibilidade |

## Contrato e responsabilidades

O agente de ingestão é dono da ArtroLove, modelos, importação, exportação e API pública. Este checkpoint altera somente o consumidor Site-2026. O contrato existente `/api/public/members` inclui IDs públicos, nome, cargo/descrição aprovados, foto protegida pela publicação, caminho canônico, grupo e projetos publicados. A extensão do cadastro será registrada aqui depois de confirmada pelo produtor. Email, matrícula, observações, fontes da planilha e notas de validação nunca são campos de apresentação pública.

O diretório não cria contas, não concede cargos e não presume consentimento. Conteúdo legado só poderá ser substituído por vínculo explícito e pelas regras acordadas; retirada não deve ressuscitar uma cópia histórica.

### Contrato confirmado pelo produtor em 27/09/2026

A primeira entrega de ingestão mantém o cadastro histórico privado e preserva `/api/public/members`. O consumidor React usa esse contrato e `projects[]` já publicado. A carga da planilha não cria perfil público automaticamente. A ponte entre cadastro e publicação precisa de revisão explícita por ID estável e seleção dos campos públicos, em uma extensão de backend coordenada após a ingestão. Esse item é uma dependência pendente, não um resultado já demonstrado em produção.

Os 27 registros já publicados no site são mantidos como acervo legado tipado, até associação explícita por `siteKey`. Uma associação retirada continua ocultando o registro legado. Na falha da API, o diretório oferece nova tentativa e oculta suas fichas, pois não consegue verificar retiradas recentes. Não há cache persistente de perfis no navegador ou no build.

### Diretório atual, 29/09/2026

O pedido da vice-presidência é exibir os membros ativos no site. O feed acrescenta `directoryMode: "active"` quando a ArtroLove registra a primeira decisão de publicação do cadastro. Nesse modo, a página mostra somente retratos públicos revisados; os 27 cards anteriores deixam de representar cargos ou membros atuais. Páginas individuais sem vínculo explícito mostram um aviso histórico, sem reexpor a ficha antiga. A transição ocorre após aprovação em lote na ArtroLove e permanece ativa mesmo se os retratos forem retirados. O HTML e os dados legados permanecem versionados para eventual reconciliação, sem sincronização reversa com a planilha.

Os antigos controladores por custom elements e testes dependentes de HTML fixo foram substituídos por componentes e testes React. Os motores licenciados de Canvas/WebGL permanecem bibliotecas JavaScript com fronteira tipada e ciclo de vida controlado pelo React, sem scripts CDN ou montagem automática.

### Retratos nos cards públicos, 29/09/2026

O feedback visual mostrou fotos pouco nítidas no avatar circular pequeno. Três respostas reais do endpoint público mediram 1086 × 1448 px, WebP, aproximadamente 99 a 116 KB; não há evidência de baixa resolução do arquivo. A decisão é usar o mesmo retrato aprovado em um card vertical, com `object-fit: contain`, nome/cargo no topo e ação no rodapé, seguindo a composição já usada na ArtroLove. A foto permanece colorida; hover/foco aumentam relevo, saturação e brilho, sem alterar o arquivo armazenado ou a API. O fallback público continua sendo a aranha para quem não tem retrato. A seção de liderança ordena apenas os membros classificados como liderança pela ArtroLove; o texto de cargo não promove outros membros. Critério de aceite: 22 perfis e links preservados, imagem natural maior que a área renderizada, sem distorção, conteúdo legível, liderança ordenada e build/testes verdes.

A home ainda continha oito líderes fixos, nomes de dirigentes nas descrições das áreas e contatos pessoais ligados a cargos. Esses dados envelhecem fora da fonte oficial. A seção de liderança passa a ler o mesmo feed público aprovado, em PT/EN; na falta dele, informa indisponibilidade sem mostrar uma gestão antiga. As áreas descrevem competências sem nomear responsáveis. O contato mostra o endereço institucional do clube, independente de mandatos. A classificação de liderança continua sendo decisão da ArtroLove; a página não eleva títulos da planilha a autoridade.

## Entrega e reversão

Critério de conclusão: build React/TS validado, consumidor alinhado à API de ingestão, PR e SHA publicados, deploy coordenado e smoke nos domínios atuais. Reversão por deploy do último SHA publicado. Limite de evidência: fixtures não provam que uma pessoa real foi revisada pela diretoria; se não houver registro público, declarar esse estado sem fabricar dados.
