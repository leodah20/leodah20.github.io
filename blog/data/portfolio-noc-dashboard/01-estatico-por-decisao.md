Meu portfólio já existia antes de tudo isso: HTML, CSS e JavaScript puro no GitHub Pages, visual de terminal monoespaçado, toggle claro/escuro. Funcionava. O problema é que quando eu abria em tela grande, era uma coluna de 820px centralizada com dois vãos vazios enormes dos lados, e dentro dela só texto. Na spec que escrevi antes de encostar no código, descrevi o resultado com as palavras que eu realmente usei na época: "texto HTML cru".

Duas coisas me incomodavam junto:

1. **Desperdício de espaço.** `max-width: 820px` num monitor widescreen é literalmente jogar fora dois terços da tela.
2. **Aquilo não parecia comigo.** Eu trabalho com infraestrutura — switch Cisco, MikroTik, pfSense, FortiGate, VLAN, Zabbix. Meu site parecia o de qualquer pessoa que abriu um template de terminal.

A ideia que fechou o redesign foi essa: se eu passo o dia olhando painel de monitoramento, por que meu portfólio não **é** um painel de monitoramento? Skills viram um diagrama de topologia clicável. Projetos viram cards de host monitorado. Certificações viram um LED wall. Tudo dentro da mesma linguagem de janela de terminal que já existia, pra não jogar fora o site anterior e sim evoluir ele.

Mas a decisão que realmente definiu o resto do trabalho não foi visual. Foi essa: **continuar 100% estático.**

## Por que não puxar um framework

A tentação óbvia era React + Vite, ou pelo menos alguma lib de gráfico pro diagrama. Não fui por aí, e a razão é bem prática: esse site é meu currículo. Ele tem que estar no ar daqui a dois anos sem eu ter que lembrar qual versão de qual bundler estava usando, sem `npm install` quebrando por dependência abandonada, sem build step entre "editei uma linha" e "está publicado".

Coloquei isso como restrição fechada no plano de implementação, junto com a regra mais importante do projeto — **nada de dado inventado**:

> No build step, no framework, no external JS/CSS libraries. (...) No fabricated data anywhere — e.g. project "host" cards must not show invented uptime/ping numbers, only a real online/source-only status derived from whether a `demo` link exists.

O site inteiro são quatro arquivos:

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | markup e estrutura, nada além das duas tags `<script src>` |
| `css/style.css` | tokens de tema (claro/escuro), layout, todos os componentes |
| `js/content.js` | conteúdo editável — dados puros, sem lógica de render |
| `js/main.js` | renderização e interação |

Sendo honesto sobre "zero dependência externa": a única requisição externa que a página faz por design é a webfont JetBrains Mono do Google Fonts. Nada de bundler, nada de `node_modules`, nada de CDN de biblioteca.

O trade-off é direto e eu topei conscientemente: **tudo que uma lib faria por mim, eu escrevo na mão.**

## O que "sem lib" custa: o diagrama de topologia

`CONTENT.skills` é um array de 6 categorias (redes, servidores e virtualização, segurança e firewall, equipamentos, linguagens e dev, idiomas). Cada uma precisa virar um nó em volta de um nó central. Sem D3, sem lib de grafo — trigonometria e `createElementNS`:

```js
function computeRadialPositions(count, cx, cy, radius, startAngleDeg) {
  const positions = [];
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    const angleDeg = startAngleDeg + step * i;
    const angleRad = (angleDeg * Math.PI) / 180;
    positions.push({
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad)
    });
  }
  return positions;
}
```

É uma função pura, sem efeito colateral, e isso foi de propósito: esse repo não tem test runner (adicionar um violaria a regra do build step), então o "teste" dela é um `node -e` que confere se com `startAngleDeg = -90` o primeiro nó cai exatamente em cima do centro e se todos os nós ficam a distância exata do raio.

E aí veio o primeiro tapa de quem veio do HTML: **`<text>` em SVG não quebra linha sozinho.** Um rótulo como "servidores e virtualizacao" renderiza numa linha só e vaza do `viewBox`. O comentário que deixei no código é literalmente o registro do problema:

```js
// SVG <text> never wraps on its own (unlike HTML), so a long label like
// "servidores e virtualizacao" would render as one line and run past the
// viewBox edge, getting clipped. Greedily wraps on word boundaries instead.
function wrapSvgLabel(text, maxChars) { /* ... */ }
```

Coisa que qualquer lib de gráfico resolveria em zero linha. Aqui foram duas funções (`wrapSvgLabel` + `setSvgTextLines` gerando `<tspan>`). Foi o preço, e eu já sabia que ia pagar.

## A regra que mais me segurou

Os cards de projeto parecem host monitorado — nome, dot de status, stack, links. A tentação de colocar "uptime 99.9%" ou "ping 12ms" era enorme, porque fica lindo. Não tem. O status é derivado de um dado que ou é verdade ou não existe:

```js
const isOnline = Boolean(p.demo);
```

Se o projeto tem link de demo real e acessível, o card mostra "online" com dot verde. Se não tem, mostra "source only" com dot apagado. E deixei isso escrito no README pro meu eu do futuro não afrouxar a regra: *only set a `demo` link if it's real and reachable — nothing is fabricated.*

## O problema que HTML puro não resolve: o calendário de contribuições

A seção `#github-status` puxa dados de verdade do GitHub. Stats do perfil, breakdown de linguagens e atividade recente saem da **REST API pública** — dá pra fazer com `fetch()` direto do navegador, sem token, cacheado 10 minutos em `sessionStorage` pra não estourar rate limit, e com mensagem de erro visível se falhar em vez de quebrar a página.

Mas o heatmap de contribuições, aqueles quadradinhos verdes, não está na REST. Só existe na **GraphQL API**, e GraphQL do GitHub **exige requisição autenticada**. Ou seja: precisaria de um token. E token em código client-side é token público — não dá.

Minha primeira tentativa foi um Cloudflare Worker segurando o token como secret e devolvendo só o calendário público. Cheguei a escrever e commitar. Depois joguei fora, e o motivo está no commit: aquilo exigia **criar conta em mais um serviço, fazer deploy e gerenciar um secret** — pra um site cuja graça inteira é não depender de nada disso.

A solução que ficou usa uma coisa que o repositório já tem de graça: o `GITHUB_TOKEN` automático do GitHub Actions.

```yaml
on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch: {}
  push:
    branches: [main]
    paths-ignore:
      - "data/contributions.json"

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch contribution calendar via GraphQL
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api graphql -f query='
            query($login: String!) {
              user(login: $login) {
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                    weeks { contributionDays { date contributionCount weekday } }
                  }
                }
              }
            }' -f login="leodah20" \
            --jq '.data.user.contributionsCollection.contributionCalendar' \
            > data/contributions.json
```

O `paths-ignore` no push existe pra evitar loop: o próprio workflow commita nesse arquivo, e sem isso o commit dele dispararia ele de novo.

O fluxo completo:

```svg
<svg viewBox="0 0 640 316" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fluxo do calendário de contribuições: GitHub Actions gera o JSON, o navegador consome via fetch">
  <defs>
    <marker id="arrow-pf" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path class="diagram-arrow-head" d="M0,0 L6,3 L0,6 Z"/>
    </marker>
  </defs>

  <rect class="diagram-group" x="4" y="10" width="632" height="110" rx="6"/>
  <text class="diagram-label" x="16" y="25">GitHub Actions — a cada 6h + push na main</text>

  <rect class="diagram-box" x="5" y="40" width="190" height="60" rx="6"/>
  <text class="diagram-text" x="100" y="60" text-anchor="middle">GITHUB_TOKEN</text>
  <text class="diagram-text" x="100" y="75" text-anchor="middle">automático</text>
  <text class="diagram-text--dim" x="100" y="90" text-anchor="middle">(não sai do runner)</text>

  <line class="diagram-arrow diagram-arrow--dashed" x1="195" y1="70" x2="207" y2="70" marker-end="url(#arrow-pf)"/>

  <rect class="diagram-box" x="210" y="47" width="200" height="46" rx="6"/>
  <text class="diagram-text" x="310" y="66" text-anchor="middle">gh api graphql</text>
  <text class="diagram-text--dim" x="310" y="81" text-anchor="middle">contributionCalendar</text>

  <line class="diagram-arrow" x1="410" y1="70" x2="422" y2="70" marker-end="url(#arrow-pf)"/>

  <rect class="diagram-box diagram-box--accent" x="425" y="47" width="205" height="46" rx="6"/>
  <text class="diagram-text" x="527" y="66" text-anchor="middle">data/contributions.json</text>
  <text class="diagram-text--dim" x="527" y="81" text-anchor="middle">commitado no próprio repo</text>

  <path class="diagram-arrow" d="M528,93 L528,120 L125,120 L125,140" fill="none" marker-end="url(#arrow-pf)"/>
  <text class="diagram-text--dim" x="326" y="113" text-anchor="middle">vira arquivo estático (mesmo commit)</text>

  <rect class="diagram-group" x="4" y="140" width="466" height="166" rx="6"/>
  <text class="diagram-label" x="16" y="156">Navegador do visitante</text>

  <rect class="diagram-box" x="5" y="168" width="240" height="60" rx="6"/>
  <text class="diagram-text" x="125" y="188" text-anchor="middle">fetch api.github.com</text>
  <text class="diagram-text" x="125" y="203" text-anchor="middle">/users /repos /events</text>
  <text class="diagram-text--dim" x="125" y="218" text-anchor="middle">(REST público)</text>

  <line class="diagram-arrow" x1="245" y1="198" x2="257" y2="198" marker-end="url(#arrow-pf)"/>

  <rect class="diagram-box" x="260" y="175" width="190" height="46" rx="6"/>
  <text class="diagram-text" x="355" y="194" text-anchor="middle">stats + linguagens</text>
  <text class="diagram-text--dim" x="355" y="209" text-anchor="middle">+ atividade</text>

  <rect class="diagram-box diagram-box--accent" x="5" y="240" width="240" height="60" rx="6"/>
  <text class="diagram-text" x="125" y="260" text-anchor="middle">fetch</text>
  <text class="diagram-text" x="125" y="275" text-anchor="middle">data/contributions.json</text>
  <text class="diagram-text--dim" x="125" y="290" text-anchor="middle">(mesma origem, estático)</text>

  <line class="diagram-arrow" x1="245" y1="270" x2="257" y2="270" marker-end="url(#arrow-pf)"/>

  <rect class="diagram-box" x="260" y="247" width="190" height="46" rx="6"/>
  <text class="diagram-text" x="355" y="266" text-anchor="middle">heatmap de</text>
  <text class="diagram-text--dim" x="355" y="281" text-anchor="middle">contribuições</text>
</svg>
```

O ponto que eu gosto: o site não sabe que existe GraphQL. Pra ele, `data/contributions.json` é só mais um arquivo estático servido pelo Pages, na mesma origem, igual ao CSS. O token nunca sai do runner. Não tem serviço externo, não tem secret pra rotacionar, não tem conta nova.

## O que quebrou no caminho

Um bug que vale registrar porque não tem nada a ver com o que eu esperava: no mobile o site rolava horizontalmente. A causa raiz não foi o fundo animado nem imagem larga. Era `main { margin: 0 auto }` — escrito pro layout desktop, onde o `body` é `flex-direction: row` e margem lateral automática é eixo principal, inofensiva. No breakpoint de 620px o `body` vira `column`, os eixos trocam, a margem automática passa a ser **cross-axis**, e pela spec do flexbox isso troca o `main` de "estica pra preencher" para "encolhe pro tamanho do conteúdo". Resultado: `main` renderizando a 817px dentro de um pai de 372px.

É o mesmo tipo de investigação que eu faço no trabalho quando alguém diz "a rede está lenta": o sintoma nunca está onde você olha primeiro.

## Onde tá agora, e o próximo passo

O site está no ar em [leodah20.github.io](https://leodah20.github.io): sidebar de navegação com tracking de seção via `IntersectionObserver`, diagrama de topologia com 6 categorias clicáveis, LED wall com 3 certificações em destaque e o resto em pills, 4 projetos como host cards, seção GitHub ao vivo, fundo com aurora boreal e starfield, e tema claro/escuro com contraste auditado (isso rendeu um capítulo inteiro dessa série — o tema claro que eu tinha feito estava reprovando em WCAG AA feio).

E tem um problema que eu descobri **escrevendo este capítulo**, e corrigi assim que fechei a investigação: o workflow do calendário roda a cada 6 horas e todas as execuções aparecem verdes, mas `data/contributions.json` não recebia commit novo desde o seed inicial de 24/07 — o último dia dentro do arquivo continuava `2026-07-24`. Olhando o step de commit:

```bash
git add data/contributions.json
git diff --staged --quiet || git commit -m "chore: refresh contribution calendar data"
git diff --staged --quiet || git push
```

Depois que o `git commit` roda, não sobra nada staged — então o segundo `git diff --staged --quiet` sai com sucesso e o `||` **pula o `git push`**. O commit acontece dentro do runner e morre lá. O job termina verde porque nada falhou.

Ou seja: o calendário que estava no ar era real, mas congelado. A correção foi trocar os dois `git diff --staged --quiet` independentes por um único `if`, garantindo que o push só é pulado quando o commit também foi:

```bash
git add data/contributions.json
if git diff --staged --quiet; then
  echo "no changes to contributions.json, skipping commit"
else
  git commit -m "chore: refresh contribution calendar data"
  git push
fi
```

Prefiro registrar o bug e a correção aqui do que fingir que estava tudo funcionando desde o início. O capítulo 6 desta série entra em mais detalhe nesse diagnóstico — e no que mais eu quero automatizar no site sem adicionar backend.
