# Refatoração de contratos públicos do site

Data: 01/10/2026. Base: `6fb725365e075d09c841dd00900e2c13518d6632`.

## Objetivo e restrições

Reduzir implementações equivalentes e retirar artefatos sem consumidor, preservando desenho, conteúdo institucional, metadados, efeitos ativos, relações históricas e as seis URLs PT/EN. A mudança não altera publicação de membros, permissões, consentimento ou fonte de dados. Não inclui integração de branches, configuração do provedor nem deploy.

Código e fixtures deste contrato têm audiência pública. Fixtures usam exclusivamente destinos e dados sintéticos. Nenhum módulo de servidor, cadastro privado, relatório operacional ou fonte privada será importado ou reproduzido neste repositório.

## Contratos e consumidores

| ID | Fonte após a mudança | Consumidores | Diferenças preservadas | Aceite |
| --- | --- | --- | --- | --- |
| REF-URL-01 | `src/lib/public-https-url.ts` e `contracts/public-https-url.cases.json` | Links de projetos de membros e conteúdo editorial | Membros mantêm string vazia opcional e exceção em link inválido; editorial mantém `null`; allowlist de imagens permanece específica | Mesmo corpus sintético nos dois adaptadores; links válidos normalizados; rejeições sem afrouxar imagens |
| REF-LEG-01 | `src/data/legacy-members.ts` | Diretório em modo legado e perfis históricos | Textos e três âncoras por idioma, ordem das equipes e múltiplas relações da mesma pessoa | 27 relações por idioma; snapshot do conteúdo público anterior sem `gridClass`; active/legacy/retirada/falha preservados |
| REF-ROUTE-01 | Manifest JSON de seis rotas | Vite, runtime, pré-render e verificador | Templates e metadados individuais; expectativa independente dos seis endereços no verificador/teste | Igualdade de conjuntos, templates existentes, seis HTML pré-renderizados e idioma correto |
| REF-ID-01 | Identidade e prontidão em `App` | Navbar e perfil | SSR começa sem query e com loading; leitura só após montagem no browser | Entrada direta, chave ausente/inválida, PT/EN com query/hash, rerender e hidratação sem divergência |
| REF-RET-01 | Grafo de consumidores e CSS atual | Home, diretório, perfil, modal e efeitos | `MemberCard`, `useProfileCard`, `sponsorModal`, animate-pulse e motores JS permanecem | Retirada estreita de wrapper, campo e seletores sem produtor; testes e comparação visual sem redesenho |

### Política HTTPS pública

`normalizePublicHttpsUrl(value: unknown): string | null` é uma função pura, sem consulta DNS, fetch ou dependência de servidor. Aceita apenas string HTTPS absoluta com prefixo `https://` sem distinção de caixa. Aplica o limite de **2000 unidades UTF-16 da entrada bruta antes de trim e do href canônico**, não limite de bytes; depois faz `trim` para validação e normalização. Espaços externos contam no limite de entrada. O limite canônico evita aceitar uma entrada Unicode que, após serialização, excederia o contrato dos leitores públicos. A rejeição antecipada mantém o tratamento de URL inválida existente; não amplia o DTO nem o armazenamento.

Retorna `URL.href` canônico ou `null`. Rejeita entrada vazia, controles ASCII internos, DEL, barra invertida, whitespace na autoridade, esquema reparado pelo parser e credenciais. Espaço no caminho é normalizado para `%20`. Portas HTTPS públicas explícitas permanecem válidas; a porta HTTPS padrão 443 é removida pelo parser. Para a política de host, ignora ponto final e rejeita destinos sem domínio público, localhost e sufixos `.localhost`, `.local`, `.internal`; IPv4 privado, loopback, link-local, CGNAT e multicast/reservado. IPv6 global permanece aceito; prefixos `::`, `fc`, `fd`, `fe8` a `feb` são rejeitados. Essa política de apresentação não substitui autorização nem validação de uma API.

O corpus inclui caixa do esquema, normalização, credenciais, portas, controles, formas reparadas, hosts locais com ponto final, IPv4 canônico/reparado, CGNAT, multicast, IPv6 global/local/mapeado e bordas da entrada e serialização com Unicode explícito. A URL aceita deve continuar aceita após serialização e nova validação (idempotência). Os adaptadores preservam seus contratos de optionalidade e erro.

### Acervo e identidade

Campos invariantes (`siteKey`, nome, foto, ícone e capitão) são definidos uma vez por relação histórica de equipe. Posição/badge, títulos/descrições e âncoras permanecem localizados. A API `legacyTeams(english)` e exports PT/EN são mantidos para os consumidores atuais. Não deduplicar relações legítimas da mesma pessoa entre equipes.

O catálogo só aparece após feed válido em modo legado. Tombstones continuam ocultando associações retiradas. Modo ativo não ressuscita fichas históricas, e falha de atualização apaga perfis cuja disponibilidade não pode ser confirmada. Esses comportamentos existentes são critérios obrigatórios de regressão.

`App` passa `profileKey` e `queryReady` para o perfil. O perfil recebe a identidade como prop e não lê `window.location` novamente. Uma prop direta continua permitindo testes de componentes; prerender e primeira renderização hidratada compartilham o estado de loading.

### Retirada e preservação de visual

`ProfileCardFrame` e `gridClass` só serão retirados após busca de referências em entradas, componentes, testes e configuração. O hook/card atual permanece. CSS será alterado somente nos seletores comprovadamente sem produtor: custom elements retirados, IDs de modais antigos, aranha flutuante/animações sem elemento e o seletor que exigia seções filhas diretas do body. A borda antiga não será restaurada, pois isso modificaria o desenho atual.

O grupo `sponsorModal` conserva suas propriedades, abertura/fechamento, foco e redução de movimento. `.animate-pulse` tem produtor atual e sua desativação pela identidade é preservada. `.safe-container` conserva padding efetivo de 1.5rem nas seis páginas. Outros estilos e bibliotecas de efeitos permanecem.

## Baseline e validação

Antes das mudanças de produto: registrar o SHA, validar typecheck/test/build, medir JS/CSS produzido e preservar hashes do conteúdo público localizado. Quando o runtime local permitir, capturar antes/depois nas mesmas condições: home e modal, diretório legacy/active nas três views, perfil PT/EN, desktop/mobile e movimento reduzido. Screenshots e recibos operacionais ficam fora do artefato público.

As medições são descritivas. Não há meta presumida de bundle, carregamento ou usabilidade. Retirar um módulo já sem import pode não reduzir o bundle. Screenshot, JSDOM e build não comprovam usabilidade com pessoas nem produção.

Checks de conclusão: `npm run typecheck`, `npm test`, `npm run build`; corpus HTTPS nos adaptadores; snapshot/paridade do acervo; rotas e artefato público; SSR/hidratação e identidade; regressões existentes de retirada, indisponibilidade, teclado, mobile e movimento reduzido. A execução local termina em checkpoint para revisão e publicação coordenada separadamente.
