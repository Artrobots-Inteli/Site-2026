# Identidade visual do site, 27/09/2026

Fonte: pedido da gestão em 27/09/2026 e duas referências visuais fornecidas: aranha eletrônica branca sobre azul/violeta e apresentação da diretoria 2026.2. O pedido inclui atualizar a disponibilidade para 10h às 18h. A aplicação ArtroLove mantém sua própria especificação e nova marca no repositório correspondente. A atualização do pedido inclui o recorte da aranha em perspectiva como direção para a marca da plataforma; a cópia `assets/artrolove-spider.png` identifica somente o acesso à ArtroLove no início, sem substituir a marca institucional.

## Decisão e motivos

O site atual usa fundos quase pretos, cinza e laranja predominantes, distantes das referências. A evolução usa fundos azul-claro e lavanda, texto púrpura escuro, contraste consistente, retícula discreta somente nas áreas de apresentação e títulos condensados. O ativo institucional `assets/logo_circulo.png` já contém a aranha eletrônica da referência e permanece a marca oficial do clube. Não substituir por uma mascote inventada.

O ponto de comparação é a versão `0edcea4`. Recolorir somente o fundo manteria textos brancos ilegíveis e cartões desconectados. Por isso a mudança abrange navegação, apresentação, cartões, diretório, perfis públicos, formulários e rodapé nas seis páginas PT/EN. O laranja permanece um acento secundário. Fotos, perfis, links, aprovações e conteúdo factual são preservados, exceto o horário solicitado. A aranha móvel e as animações decorativas contínuas deixam de disputar atenção com o conteúdo; a marca aparece estática na apresentação.

## Requisitos e critérios de aceite

| ID | Comportamento | Evidência prevista |
| --- | --- | --- |
| VIS-01 | Início, membros e perfil, em PT/EN, compartilham paleta e tipografia. | Inspeção do HTML/CSS e navegador desktop/móvel. |
| VIS-02 | Marca institucional preservada, sem imagens remotas novas, novos slogans ou alteração de fotos de membros. | Diff e integridade dos 27 perfis no teste existente. |
| VIS-03 | Controles continuam utilizáveis por teclado, estados de foco visíveis e movimento reduzido respeitado; sem rolagem horizontal da página em 390px. | CSS e QA no navegador; tabelas/carrosséis podem ter rolagem interna. |
| VIS-04 | Contato informa segunda a sexta, 10h às 18h; inglês informa Mon–Fri, 10:00–18:00. | Busca nas duas páginas e página publicada. |
| VIS-05 | Feed aprovado, retirada de perfis, links de projeto, troca de idioma e origem HTTPS não mudam. | `node --test tests/member-directory.test.cjs`. |
| VIS-06 | Exportação contém todos os estilos usados e não expõe especificações/testes. | `node deploy/build.cjs` e conferência de `dist`. |
| VIS-07 | Cards e painéis de categorias da área de membros usam vidro translúcido azul/lavanda, reflexos estáticos e sombra discreta. A faixa roxa vertical da esquerda desaparece. Sem suporte a backdrop-filter ou com transparência reduzida, usar superfície opaca legível. | Diff, teste do diretório, build e inspeção no navegador. |

Rastreabilidade: referências da gestão → VIS-01/02/03 → `identity.css`, páginas PT/EN e componentes de navegação/rodapé; pedido de horário → VIS-04 → `index.html`/`index-en.html`; contrato público existente → VIS-05 → testes de diretório; publicação estática existente → VIS-06 → exportação.

Limites: mudança visual não comprova aumento de retenção. A métrica desta entrega é consistência visual e ausência de regressões nos caminhos existentes. Validação no navegador pendente neste commit; o responsável pela publicação deve registrar desktop, móvel, menu e páginas PT/EN antes de publicar. Os identificadores de publicação são registrados após essa validação.

## Validação da implementação

- `node --test tests/member-directory.test.cjs`: 9 testes aprovados, incluindo 27 identidades PT/EN, fotos, retirada, associação e origem HTTPS.
- `node --check script.js`, `components/navbar.js` e `components/footer.js`: sintaxe válida.
- `node deploy/build.cjs`: exportação concluída. As seis páginas e `identity.css` exportados correspondem à fonte; `specs` e `tests` não entram em `dist`.
- Verificação estática: horário PT/EN atualizado, mesma folha de identidade e fonte nas seis páginas. Menu compacto até 1279px; apresentação em uma coluna abaixo de 768px. A ausência de overflow precisa também da medição em navegador.
- Contraste calculado dos pares principais: texto púrpura/azul 10,49:1; texto secundário/lavanda 8,30:1; branco/botão violeta 8,21:1; link violeta/branco 10,45:1. Isso cobre os tokens principais, sem substituir uma auditoria de todos os estados renderizados.
- Os efeitos antigos de mascote móvel e ocultação de seções até rolar foram removidos. Âncoras e carrossel respeitam movimento reduzido. Nenhuma alteração na busca do feed público ou nos critérios de aprovação.

Pendência factual preexistente: a seção de contato ainda lista emails antigos em `@artrobots.tech`, enquanto o serviço Zoho foi aposentado. A identidade visual não valida esses endereços; a substituição por contatos institucionais confirmados fica em checkpoint separado.


## Correção após QA no navegador

O primeiro QA desktop (1280px) encontrou título, subtítulo e link da apresentação brancos sobre azul-claro. A causa foi a classe legada `text-white` no próprio `body`: a regra `.artrobots-site .text-white` cobre descendentes, não o elemento raiz. O CSS gerado em tempo de execução pelo CDN Tailwind prevaleceu sobre a regra simples `.artrobots-site`. O mesmo problema podia afetar outros títulos herdados e o fundo do corpo.

Correção: remover `text-white` e `bg-dark` do `body` nas seis páginas, definir os tokens do corpo em `body.artrobots-site` e explicitar a cor nos dois tipos de apresentação. Cartões herdam o texto do corpo corrigido; botões violeta mantêm regra própria para texto branco.

Os valores de contraste acima são cálculos entre tokens, não medições do estilo computado do DOM. A primeira captura demonstrou que tokens corretos não garantem aplicação correta. Validação visual/computed após esta correção ainda pendente e necessária antes da publicação.

## Vidro translúcido na área de membros

Fonte: solicitação posterior da gestão para aplicar efeito “liquid glass” aos cards e retirar a lateral indicada na captura. O elemento apontado é a borda esquerda de 5px de `.team-header`, herdada de `components/member-directory.css`. A mudança substitui essa faixa por uma borda fina uniforme e aplica vidro aos painéis de categoria e aos cards públicos, históricos e conectados.

Decisão: reflexos por gradientes estáticos, camada translúcida azul/lavanda, blur moderado do fundo e sombra fina. O diretório recebe um fundo claro suave que permite perceber o vidro. Sem animação contínua, distorção de texto ou filtro nas fotos. Fallback opaco quando `backdrop-filter` não está disponível, quando a preferência `prefers-reduced-transparency` é reconhecida ou em cores forçadas.

Fontes preservadas: nomes, fotos e histórico públicos continuam no HTML original; perfis novos continuam vindo exclusivamente do snapshot aprovado da ArtroLove. Este ajuste altera CSS, não informações pessoais, classificação, links nem aprovação. A inspeção visual/computed do vidro após implementação permanece pendente neste commit.
