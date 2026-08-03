Quem joga ou acompanha futebol de várzea já entrou num bolão de grupo de WhatsApp. Alguém manda a tabela da rodada, o pessoal responde o palpite no grupo, e no domingo à noite tem sempre a mesma discussão: quem acertou o quê, quem mandou o palpite depois do jogo já ter começado, e quem tá na frente.

O VZBet nasceu dessa cena. É um app de palpites de placar para times e campeonatos de várzea — no seed eu usei times reais das ligas amadoras de Ferraz de Vasconcelos/SP (Copa Metal Ferraz Municipal e Copa das Comunidades). O torcedor se cadastra, dá o palpite antes do apito inicial, ganha pontos conforme acerta, e disputa um ranking.

Só que antes de escrever qualquer endpoint eu tive que decidir uma coisa que definiu o projeto inteiro.

## A decisão que veio antes do código: nenhum dinheiro passa pelo app

A ideia original era aposta de verdade. Aí eu fui ler a Lei 14.790/2023: aposta de quota fixa com dinheiro real no Brasil exige autorização SPA/MF, R$30M de capital social, R$30M de outorga e R$5M de reserva. Isso não é "barreira alta pra um projeto indie", isso é outro planeta.

Então pivotei: o VZBet é um jogo de pontos e ranking. Nenhum valor monetário circula dentro do app. Se um grupo quiser combinar um prêmio, isso é resolvido inteiramente fora dele — o app não sabe, não registra, não intermedeia.

Isso não é um detalhe de rodapé, é uma decisão de modelagem. Não existe tabela de carteira, saldo, transação ou odd no schema. O que existe é palpite e ponto. Todo o resto do banco existe pra alimentar isso.

## As 6 tabelas

O banco é PostgreSQL 16 com Prisma 7.9.1, e tem exatamente seis tabelas. Esse é o DER real do `schema.prisma` de hoje (campos reduzidos aos mais relevantes — a lista completa de tipos está no schema):

```svg
<svg viewBox="0 0 720 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama entidade-relacionamento do VZBet: seis tabelas — Championship, Team, User, Match, Player e Prediction">
  <defs>
    <marker id="arrow-vzbet-er" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path class="diagram-arrow-head" d="M0,0 L6,3 L0,6 Z"/>
    </marker>
  </defs>

  <!-- CHAMPIONSHIP -->
  <rect class="diagram-box" x="20" y="20" width="190" height="90" rx="6"/>
  <text class="diagram-text" x="115" y="36" text-anchor="middle" font-weight="700">CHAMPIONSHIP</text>
  <line x1="20" y1="44" x2="210" y2="44" stroke="var(--border)"/>
  <text class="diagram-text--dim" x="30" y="60">id PK</text>
  <text class="diagram-text--dim" x="30" y="78">name, season</text>
  <text class="diagram-text--dim" x="30" y="96">format (liga/mata-mata)</text>

  <!-- TEAM -->
  <rect class="diagram-box" x="250" y="20" width="190" height="90" rx="6"/>
  <text class="diagram-text" x="345" y="36" text-anchor="middle" font-weight="700">TEAM</text>
  <line x1="250" y1="44" x2="440" y2="44" stroke="var(--border)"/>
  <text class="diagram-text--dim" x="260" y="60">id PK</text>
  <text class="diagram-text--dim" x="260" y="78">name, region</text>
  <text class="diagram-text--dim" x="260" y="96">foundedYear (opcional)</text>

  <!-- USER -->
  <rect class="diagram-box" x="490" y="20" width="190" height="90" rx="6"/>
  <text class="diagram-text" x="585" y="36" text-anchor="middle" font-weight="700">USER</text>
  <line x1="490" y1="44" x2="680" y2="44" stroke="var(--border)"/>
  <text class="diagram-text--dim" x="500" y="60">id PK</text>
  <text class="diagram-text--dim" x="500" y="78">email UK, passwordHash</text>
  <text class="diagram-text--dim" x="500" y="96">role (ADMIN / TORCEDOR)</text>

  <!-- MATCH -->
  <rect class="diagram-box diagram-box--accent" x="130" y="180" width="230" height="122" rx="6"/>
  <text class="diagram-text" x="245" y="196" text-anchor="middle" font-weight="700">MATCH</text>
  <line x1="130" y1="204" x2="360" y2="204" stroke="var(--border)"/>
  <text class="diagram-text--dim" x="140" y="220">id PK</text>
  <text class="diagram-text--dim" x="140" y="238">championshipId FK</text>
  <text class="diagram-text--dim" x="140" y="256">homeTeamId FK · awayTeamId FK</text>
  <text class="diagram-text--dim" x="140" y="274">homeScore, awayScore, status</text>

  <!-- PLAYER -->
  <rect class="diagram-box" x="490" y="180" width="190" height="90" rx="6"/>
  <text class="diagram-text" x="585" y="196" text-anchor="middle" font-weight="700">PLAYER</text>
  <line x1="490" y1="204" x2="680" y2="204" stroke="var(--border)"/>
  <text class="diagram-text--dim" x="500" y="220">id PK</text>
  <text class="diagram-text--dim" x="500" y="238">teamId FK</text>
  <text class="diagram-text--dim" x="500" y="256">position, number</text>

  <!-- PREDICTION -->
  <rect class="diagram-box diagram-box--accent" x="130" y="340" width="230" height="122" rx="6"/>
  <text class="diagram-text" x="245" y="356" text-anchor="middle" font-weight="700">PREDICTION</text>
  <line x1="130" y1="364" x2="360" y2="364" stroke="var(--border)"/>
  <text class="diagram-text--dim" x="140" y="380">id PK</text>
  <text class="diagram-text--dim" x="140" y="398">userId FK · matchId FK (UK juntos)</text>
  <text class="diagram-text--dim" x="140" y="416">predictedOutcome, predictedHome/Away</text>
  <text class="diagram-text--dim" x="140" y="434">pointsEarned (nulo até pontuar)</text>

  <!-- CHAMPIONSHIP -> MATCH -->
  <path class="diagram-arrow" d="M115,110 L115,150 L170,150 L170,180" marker-end="url(#arrow-vzbet-er)"/>
  <text class="diagram-text--accent" x="145" y="146" text-anchor="middle">organiza · 1–N</text>

  <!-- TEAM -> MATCH (casa) -->
  <path class="diagram-arrow" d="M300,110 L300,160 L245,160 L245,180" marker-end="url(#arrow-vzbet-er)"/>
  <text class="diagram-text--accent" x="300" y="156" text-anchor="middle">casa · 1–N</text>

  <!-- TEAM -> MATCH (fora) -->
  <path class="diagram-arrow" d="M400,110 L400,170 L320,170 L320,180" marker-end="url(#arrow-vzbet-er)"/>
  <text class="diagram-text--accent" x="400" y="166" text-anchor="middle">fora · 1–N</text>

  <!-- TEAM -> PLAYER -->
  <path class="diagram-arrow" d="M440,65 L465,65 L465,225 L490,225" marker-end="url(#arrow-vzbet-er)"/>
  <text class="diagram-text--accent" x="467" y="150" text-anchor="middle">tem · 1–N</text>

  <!-- USER -> PREDICTION (routed right of PLAYER to avoid overlap) -->
  <path class="diagram-arrow" d="M585,110 L585,130 L700,130 L700,401 L360,401" marker-end="url(#arrow-vzbet-er)"/>
  <text class="diagram-text--accent" x="700" y="265" text-anchor="middle" transform="rotate(90 700 265)">envia · 1–N</text>

  <!-- MATCH -> PREDICTION -->
  <path class="diagram-arrow" d="M245,302 L245,340" marker-end="url(#arrow-vzbet-er)"/>
  <text class="diagram-text--accent" x="280" y="322" text-anchor="start">recebe · 1–N</text>
</svg>
```

Três detalhes desse schema que valem mais do que parecem:

**`Match` aponta duas vezes pra `Team`.** Quando um model referencia o outro duas vezes, o Prisma não tem como adivinhar qual foreign key é qual. A solução é nomear as relações: `@relation("HomeTeam")` de um lado, `@relation("AwayTeam")` do outro. Sem isso o `prisma generate` simplesmente não sabe montar o client.

**`@@unique([userId, matchId])` no `Prediction`.** Isso é "um palpite por torcedor por partida" garantido no banco, não na aplicação. E é justamente o que me permitiu não ter endpoint de update: o `SubmitPredictionUseCase` faz `upsert` nessa chave composta, então o torcedor reenviando o palpite antes do apito sobrescreve a linha existente em vez de criar uma duplicada. Editar palpite é o mesmo `POST /predictions` de sempre.

**`pointsEarned` é nullable de propósito.** Um palpite nasce sem pontuação. Ele só é preenchido quando o admin registra o resultado da partida. E se a partida for cancelada em vez de finalizada, aquele `pointsEarned` fica `null` pra sempre — partida cancelada não pontua, e o schema reflete isso em vez de fingir que zero e "ainda não pontuado" são a mesma coisa.

## A regra de pontuação (que eu reescrevi inteira)

A primeira versão era o clássico: placar exato = 3 pontos, acertou só o resultado = 1 ponto, errou = 0. Funcionava, tava testada, tava documentada como o mecanismo principal do projeto.

E era chata. Genérica demais. Não tinha risco nenhum — chutar um placar sempre valia mais do que não chutar, porque no pior caso você ainda levava o ponto do resultado.

Então eu troquei por uma mecânica inspirada em aposta múltipla (parlay), com duas pernas dentro da mesma partida:

- **Simples** — só o resultado (`CASA`/`EMPATE`/`FORA`): acertou, 3 pontos. Errou, 0.
- **Múltipla** — resultado + placar exato: acertou o placar, 7 pontos. Errou o placar, **0** — mesmo que o resultado estivesse certo.

Esse último caso é o ponto inteiro da mecânica. Arriscar a múltipla troca a garantia dos 3 pontos por uma chance de 7, tudo ou nada. Tem risco de verdade.

O código disso é uma função pura, sem NestJS, sem Prisma, sem nada — `backend/src/predictions/domain/scoring.ts`:

```typescript
export function calculatePredictionPoints(guess: PredictionGuess, result: MatchResult): number {
  const actualOutcome = outcomeOf(result.homeScore, result.awayScore);
  const isMultipla = guess.predictedHome !== null && guess.predictedAway !== null;

  if (!isMultipla) {
    return guess.predictedOutcome === actualOutcome ? 3 : 0;
  }

  const scoreCorrect = guess.predictedHome === result.homeScore && guess.predictedAway === result.awayScore;
  return scoreCorrect ? 7 : 0;
}
```

```svg
<svg viewBox="0 0 750 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fluxograma da função calculatePredictionPoints: aposta simples vale 3 ou 0, aposta múltipla vale 7 ou 0 (tudo ou nada)">
  <defs>
    <marker id="arrow-vzbet-score" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path class="diagram-arrow-head" d="M0,0 L6,3 L0,6 Z"/>
    </marker>
  </defs>

  <rect class="diagram-box" x="210" y="10" width="280" height="42" rx="6"/>
  <text class="diagram-text" x="350" y="36" text-anchor="middle">calculatePredictionPoints(guess, result)</text>

  <line class="diagram-arrow" x1="350" y1="52" x2="350" y2="64" marker-end="url(#arrow-vzbet-score)"/>

  <rect class="diagram-box diagram-box--accent" x="170" y="70" width="360" height="56" rx="6"/>
  <text class="diagram-text" x="350" y="93" text-anchor="middle">predictedHome e predictedAway</text>
  <text class="diagram-text" x="350" y="110" text-anchor="middle">preenchidos?</text>

  <path class="diagram-arrow" d="M260,126 L260,150 L170,150 L170,164" marker-end="url(#arrow-vzbet-score)"/>
  <text class="diagram-text--accent" x="215" y="145" text-anchor="middle">não (simples)</text>

  <path class="diagram-arrow" d="M440,126 L440,150 L540,150 L540,164" marker-end="url(#arrow-vzbet-score)"/>
  <text class="diagram-text--accent" x="490" y="145" text-anchor="middle">sim (múltipla)</text>

  <rect class="diagram-box diagram-box--accent" x="30" y="170" width="280" height="56" rx="6"/>
  <text class="diagram-text" x="170" y="193" text-anchor="middle">predictedOutcome ==</text>
  <text class="diagram-text" x="170" y="210" text-anchor="middle">resultado real?</text>

  <rect class="diagram-box diagram-box--accent" x="400" y="170" width="280" height="56" rx="6"/>
  <text class="diagram-text" x="540" y="193" text-anchor="middle">placar exato</text>
  <text class="diagram-text" x="540" y="210" text-anchor="middle">bate?</text>

  <path class="diagram-arrow" d="M100,226 L100,280" marker-end="url(#arrow-vzbet-score)"/>
  <text class="diagram-text--accent" x="112" y="250">sim</text>
  <rect class="diagram-box" x="30" y="280" width="140" height="46" rx="6"/>
  <text class="diagram-text" x="100" y="308" text-anchor="middle">3 pontos</text>

  <path class="diagram-arrow" d="M240,226 L240,250 L260,250 L260,280" marker-end="url(#arrow-vzbet-score)"/>
  <text class="diagram-text--accent" x="250" y="245" text-anchor="middle">não</text>
  <rect class="diagram-box" x="190" y="280" width="140" height="46" rx="6"/>
  <text class="diagram-text" x="260" y="308" text-anchor="middle">0 pontos</text>

  <path class="diagram-arrow" d="M470,226 L470,280" marker-end="url(#arrow-vzbet-score)"/>
  <text class="diagram-text--accent" x="482" y="250">sim</text>
  <rect class="diagram-box" x="400" y="280" width="140" height="46" rx="6"/>
  <text class="diagram-text" x="470" y="308" text-anchor="middle">7 pontos</text>

  <path class="diagram-arrow" d="M610,226 L610,250 L645,250 L645,280" marker-end="url(#arrow-vzbet-score)"/>
  <text class="diagram-text--accent" x="620" y="245" text-anchor="middle">não</text>
  <rect class="diagram-box diagram-box--accent" x="550" y="280" width="190" height="56" rx="6"/>
  <text class="diagram-text" x="645" y="303" text-anchor="middle">0 pontos —</text>
  <text class="diagram-text" x="645" y="320" text-anchor="middle">tudo ou nada</text>
</svg>
```

Ser função pura não é purismo. É que essa regra é a coisa mais importante do produto e eu queria conseguir testá-la sem subir banco, sem subir servidor, sem mock nenhum. O teste que mais me importa é justamente o do caso perverso:

```typescript
it('awards 0 points for a múltipla with the right outcome but the wrong exact score (all-or-nothing)', () => {
  const points = calculatePredictionPoints(
    { predictedOutcome: 'CASA', predictedHome: 2, predictedAway: 1 },
    { homeScore: 3, awayScore: 0 },
  );
  expect(points).toBe(0);
});
```

## Um estado impossível que o banco não bloqueia sozinho

O schema deixa `predictedHome` e `predictedAway` nullable, mas na regra do produto eles são **os dois nulos** (simples) ou **os dois preenchidos** (múltipla) — nunca um só. E se vierem preenchidos, o resultado derivado deles tem que bater com o `predictedOutcome` escolhido. Não existe palpitar "empate" e "2x1" ao mesmo tempo.

Isso o Postgres não garante por mim, então mora no use case:

```typescript
const hasHome = data.predictedHome !== null && data.predictedHome !== undefined;
const hasAway = data.predictedAway !== null && data.predictedAway !== undefined;
if (hasHome !== hasAway) {
  throw new ValidationError('Both predictedHome and predictedAway must be provided together, or neither');
}

if (hasHome && hasAway) {
  if (data.predictedHome! < 0 || data.predictedAway! < 0) {
    throw new ValidationError('Predicted score cannot be negative');
  }
  const derivedOutcome = outcomeOf(data.predictedHome!, data.predictedAway!);
  if (derivedOutcome !== data.predictedOutcome) {
    throw new ValidationError('predictedOutcome is inconsistent with the predicted score');
  }
}
```

No frontend a UI já seleciona o resultado automaticamente quando você digita o placar, então na prática essa inconsistência nunca chega ao backend. A validação existe como defesa em profundidade — nunca confiar cegamente no cliente.

## Pontuar tem que ser tudo ou nada (a nível de transação também)

A primeira versão do `RegisterMatchResultUseCase` gravava o resultado da partida e **depois** rodava um loop atualizando os pontos palpite por palpite. Uma falha no meio desse loop deixava a partida `FINALIZADA` com só parte dos palpites pontuados — e como o próprio guard bloqueia registrar resultado em partida já finalizada, aquele estado parcial ficava travado pra sempre, sem retry possível.

Corrigi juntando tudo num `$transaction` do Prisma, em `PrismaPredictionRepository`:

```typescript
await this.prisma.$transaction([
  this.prisma.match.update({
    where: { id: matchId },
    data: { homeScore: result.homeScore, awayScore: result.awayScore, status: 'FINALIZADA' },
  }),
  ...scoredPredictions.map((sp) =>
    this.prisma.prediction.update({ where: { id: sp.predictionId }, data: { pointsEarned: sp.points } }),
  ),
]);
```

O use case calcula os pontos de todos os palpites em memória (chamando a função pura) e só então manda tudo num commit só. Ou a partida inteira pontua, ou nada acontece. O ranking nunca reflete um jogo "meio pontuado".

## Onde tá agora e qual é o próximo passo

O backend está funcionando localmente: 6 módulos em Clean Architecture (auth, teams, players, championships, matches, predictions), testes unitários com repositórios mockados, e um seed com times e resultados históricos reais das duas ligas de Ferraz. O frontend em React + Vite já existe e consome a API — telas de partidas, ranking, classificação, meus palpites e um painel inicial.

O que **não** existe ainda, pra ser claro: **deploy**. Nada do VZBet está hospedado em lugar nenhum. O plano é Render (Web Service no free tier + PostgreSQL gerenciado), e as configurações que costumam derrubar o primeiro deploy já estão mapeadas, mas eu ainda não subi.

Outras pendências que estou rastreando e não vou fingir que não existem: o `app.enableCors()` está liberado pra qualquer origem, não tem rate limiting em `/auth/login`, o e2e smoke test gerado pelo CLI do NestJS continua quebrado (ts-jest não resolve os imports ESM do client gerado pelo Prisma), e o `README.md` e parte dos docs ainda descrevem a regra antiga de 3/1/0 — a documentação ficou pra trás da reescrita da pontuação e precisa ser atualizada.

No próximo capítulo eu entro na estrutura de camadas em si: as quatro pastas que se repetem em todos os 6 módulos, por que meus controllers instanciam os use-cases na mão em vez de usar o container de DI do Nest, e o sistema de erros de domínio que nasceu de um code review achando que "time não encontrado" estava virando 500.
