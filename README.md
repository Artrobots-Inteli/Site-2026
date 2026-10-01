# Site Artrobots

Frontend institucional em React e TypeScript, compilado por Vite e hospedado como site estático no Render. As seis entradas PT/EN preservam os endereços existentes. O build pré-renderiza o conteúdo institucional; o navegador consulta somente as APIs públicas da ArtroLove para dados revisados de marketing e membros.

## Desenvolvimento

Node.js 22.12 ou superior (até 24). Execute `npm ci`, depois `npm run dev`. O ambiente local usa a API pública de produção em leitura, sem credenciais. Fixtures de teste são sintéticas e não devem ser publicadas como registros reais.

- `npm run typecheck`: verificação de tipos.
- `npm test`: testes de contratos, estados e componentes React.
- `npm run build`: tipos, bundle, pré-renderização das seis páginas e verificação do artefato público.
- `npm run preview`: prévia do build.

## Organização

`src/pages` contém as páginas, `src/components` os componentes, `src/lib` contratos e projeções públicos e `src/hooks` os ciclos de atualização. O CSS e as mídias preservam a identidade publicada. Os motores Canvas/WebGL em `effects` são bibliotecas licenciadas mantidas em JavaScript, com interface tipada e montagem/desmontagem controladas pelo React. Consulte `THIRD_PARTY_NOTICES.md`.

`dist` é o único diretório publicado. Nenhuma planilha, credencial, especificação ou teste integra esse artefato. O contrato e os critérios de aceite estão em `specs/react-members-integration.md`.

## Hospedagem

O serviço Render existente aceita `node deploy/build.cjs`, que executa `npm ci` e `npm run build`. Alternativamente, o build pode usar esses dois comandos diretamente. A publicação usa um SHA com CI aprovado e preserva HTTPS e domínios existentes: [site](https://artrobots.tech/) e [ArtroLove](https://artrolove.artrobots.tech/).
