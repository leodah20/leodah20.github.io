Todo app de Pokémon GO que eu instalei fazia a mesma coisa: calculadora de IV com uma skin diferente. E o fluxo pra usar qualquer um deles é sempre igual — você tá jogando, pega um Pokémon, sai do jogo, tira print, abre o outro app, escolhe o print na galeria, lê o resultado, volta pro jogo. Cinco passos pra responder "vale a pena evoluir isso?".

O problema real não é a matemática do IV. Essa parte é fácil, é fórmula pública e brute-force. O problema é o **contexto**: a informação chega tarde e no lugar errado. Foi por isso que eu comecei o Pokémon Trainer Companion (PTC), e é por isso que a feature principal dele não é nenhuma das calculadoras — é uma **janela flutuante que fica por cima do jogo, lê a tela ao vivo e escreve a dica ali mesmo**.

As calculadoras, a Pokédex, os rankings de PvP e os counters de raid existem no projeto, funcionam, e são úteis sozinhos. Mas eles são a fundação, não o produto. O produto é o overlay.

## A restrição que define tudo

Antes de escrever a primeira linha, uma decisão fechou metade do espaço de soluções: **o app nunca conversa com o cliente do Pokémon GO**.

Não existe API pública oficial de conta ou de dados de jogo. As ferramentas que fazem login com a credencial do treinador, leem memória do processo ou chamam API privada engenharia-reversada violam os Termos de Uso da Niantic — e isso já resultou em ban permanente de conta e ação legal contra desenvolvedores. Eu documentei esse raciocínio em `docs/legal-compliance.md` porque, sinceramente, mostrar que a decisão foi tomada de propósito é parte do ponto do projeto.

Então a única entrada de dados do jogo é: **o que já está desenhado na tela do treinador**. Print da galeria, ou frame capturado ao vivo. Daí vem OCR.

Essa restrição não é só jurídica, ela decide arquitetura:

- **OCR roda no dispositivo (ML Kit).** Mandar o frame pro backend significaria transmitir e armazenar uma imagem do cliente do jogo — tratamento de dado desnecessário, e mataria a garantia de "nada sai do aparelho". Só o *resultado* do OCR (espécie, CP, HP) sai do dispositivo, e só quando o treinador toca em "Ask AI".
- **O backend é opcional pro usuário final.** Todo o núcleo do app funciona 100% offline com JSON embarcado. O backend só entra pros recursos de IA.
- **React Native tinha que ser bare workflow.** Janela flutuante e ML Kit em Kotlin exigem módulo nativo próprio; não dá pra fazer isso dentro de um workflow gerenciado.

## O loop que virou a decisão técnica mais interessante do projeto

A primeira versão do loop ao vivo era um `setInterval` em JavaScript: a cada X segundos, chama o nativo, pega um frame, roda OCR, atualiza o overlay. Funcionava lindamente — enquanto o PTC estava em primeiro plano.

Que é exatamente a situação em que o overlay **não serve pra nada**. O ponto inteiro dele é ficar por cima do Pokémon GO, com o PTC em background. E aí o Android estrangula o timer do JS e o overlay congela na última leitura.

A solução foi mover o loop inteiro pra dentro do foreground service em Kotlin. O comentário que eu deixei no `ScreenCaptureService.kt` explica o porquê melhor do que eu explicaria aqui de novo:

```kotlin
/**
 * Runs the whole "grab a frame, OCR it, hand the text to JS" loop natively on a Handler tied to
 * this Service, instead of a JS setInterval in OverlayDemoScreen. A JS timer only reliably fires
 * while its owning Activity is in the foreground -- once the trainer switches to the actual game
 * (the entire point of this overlay), Android throttles it and the overlay would freeze on its
 * last reading.
 */
private fun startPolling() { /* ... */ }

private fun recognizeCurrentFrame() {
  val bitmap = captureLatestFrame() ?: return
  textRecognizer
      .process(InputImage.fromBitmap(bitmap, 0))
      .addOnSuccessListener { visionText -> emitFrameText(visionText.text) }
      .addOnCompleteListener { bitmap.recycle() }
}
```

O service roda com `POLL_INTERVAL_MS = 4000L`, captura um frame único via `VirtualDisplay` + `ImageReader` (não vídeo contínuo — o OCR só precisa de um still por vez), roda ML Kit em Kotlin e emite o texto reconhecido pro JS. O trade-off: o loop virou código nativo, mais difícil de testar e de debugar que um `setInterval`. Em compensação, ele funciona na única hora que importa.

O caminho completo hoje é esse:

```svg
<svg viewBox="0 0 800 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de sequência: ScreenCaptureService captura e faz OCR nativamente a cada 4 segundos, envia texto para o app React Native, que analisa e atualiza o overlay, opcionalmente consultando o backend para uma dica de IA">
  <defs>
    <marker id="arrow-ptc-seq" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path class="diagram-arrow-head" d="M0,0 L6,3 L0,6 Z"/>
    </marker>
  </defs>

  <rect class="diagram-box" x="10" y="8" width="150" height="34" rx="6"/>
  <text class="diagram-text" x="85" y="29" text-anchor="middle">ScreenCaptureService</text>

  <rect class="diagram-box" x="220" y="8" width="160" height="34" rx="6"/>
  <text class="diagram-text" x="300" y="29" text-anchor="middle">App React Native</text>

  <rect class="diagram-box" x="440" y="8" width="140" height="34" rx="6"/>
  <text class="diagram-text" x="510" y="29" text-anchor="middle">Backend NestJS</text>

  <rect class="diagram-box" x="640" y="8" width="150" height="34" rx="6"/>
  <text class="diagram-text" x="715" y="29" text-anchor="middle">Janela flutuante</text>

  <line x1="85" y1="42" x2="85" y2="330" class="diagram-arrow--dashed"/>
  <line x1="300" y1="42" x2="300" y2="330" class="diagram-arrow--dashed"/>
  <line x1="510" y1="42" x2="510" y2="330" class="diagram-arrow--dashed"/>
  <line x1="715" y1="42" x2="715" y2="330" class="diagram-arrow--dashed"/>

  <text class="diagram-text--accent" x="14" y="58">↻ loop nativo, a cada 4s (dentro do foreground service)</text>

  <path class="diagram-arrow" d="M85,72 L140,72 L140,90 L85,90" marker-end="url(#arrow-ptc-seq)"/>
  <text class="diagram-text--dim" x="148" y="84">captureLatestFrame via ImageReader</text>

  <path class="diagram-arrow" d="M85,104 L140,104 L140,122 L85,122" marker-end="url(#arrow-ptc-seq)"/>
  <text class="diagram-text--dim" x="148" y="116">OCR com ML Kit</text>

  <path class="diagram-arrow" d="M85,146 L300,146" marker-end="url(#arrow-ptc-seq)"/>
  <text class="diagram-text--dim" x="192" y="140" text-anchor="middle">evento PTCOverlayFrameText (texto)</text>

  <path class="diagram-arrow" d="M300,172 L360,172 L360,190 L300,190" marker-end="url(#arrow-ptc-seq)"/>
  <text class="diagram-text--dim" x="368" y="184">analyzeOcrText → espécie, CP, HP, IV</text>

  <path class="diagram-arrow" d="M300,212 L715,212" marker-end="url(#arrow-ptc-seq)"/>
  <text class="diagram-text--dim" x="507" y="206" text-anchor="middle">updateOverlayText — dica rule-based (na hora)</text>

  <path class="diagram-arrow" d="M300,242 L510,242" marker-end="url(#arrow-ptc-seq)"/>
  <text class="diagram-text--dim" x="405" y="236" text-anchor="middle">POST /api/companion/suggest</text>

  <path class="diagram-arrow diagram-arrow--dashed" d="M510,272 L300,272" marker-end="url(#arrow-ptc-seq)"/>
  <text class="diagram-text--dim" x="405" y="266" text-anchor="middle">dica gerada pelo Gemini</text>

  <path class="diagram-arrow" d="M300,302 L715,302" marker-end="url(#arrow-ptc-seq)"/>
  <text class="diagram-text--dim" x="507" y="296" text-anchor="middle">updateOverlayText — dica da IA (substitui a anterior)</text>
</svg>
```

Repare no detalhe: a dica baseada em regras aparece **na hora**, e só depois é substituída pela resposta do Gemini quando ela chega. Se o backend estiver dormindo ou sem chave configurada, o texto que já está lá simplesmente fica. E a IA é chamada uma vez por espécie, não a cada tick — controlado por um `useRef`, não por state, justamente pra não reiniciar o effect e cancelar uma requisição em voo.

## Onde a Clean Architecture pagou a conta

O app mobile é separado em `domain/` (TypeScript puro, zero dependência de React Native), `use-cases/`, `data/` e `presentation/`. Isso soa burocrático até o dia em que você precisa alimentar o mesmo pipeline por dois caminhos diferentes.

O fluxo da galeria tem uma URI de imagem. O loop nativo já tem o texto OCR pronto (porque o ML Kit rodou em Kotlin, não no cliente JS). Se a análise estivesse acoplada ao OCR, seriam dois pipelines. Como não estava, foi só quebrar em dois:

```typescript
/**
 * Split out from {@link analyzeScreenshot} so callers that already have OCR'd text (the native
 * live-overlay loop runs ML Kit in Kotlin, not through this JS OCR client) can skip straight to
 * analysis instead of re-running OCR on an image.
 */
export function analyzeOcrText(rawText: string): ScreenshotAnalysis { /* ... */ }

export async function analyzeScreenshot(imageUri: string): Promise<ScreenshotAnalysis> {
  const rawText = await recognizeTextFromImage(imageUri);
  return analyzeOcrText(rawText);
}
```

Um `analyzeOcrText` só, cuspindo espécie, CP, HP, as combinações de IV (brute-force nas 4096), ranking de PvP, percentil de bulk, cadeia de evolução e sugestões. Os dois fluxos consomem o mesmo resultado.

O parsing também é função pura, e é onde a realidade bateu na cara do design. Eu tinha assumido que a tela mostra `HP: 175`. Não mostra:

```typescript
// CP: "CP 900" / "CP: 900" (English), or "PC3975" — Pokemon GO's Portuguese label for Combat
// Power ("Poder de Combate"), rendered with no space before the number.
const CP_PATTERNS: readonly RegExp[] = [/(?:CP|PC)\s*[:\s]?\s*(\d+)/i];

// HP: real Pokemon GO status screens put the label AFTER a "current/max" pair — "175 / 175 HP"
// (English) or "175 / 175 PS" (Portuguese, "Pontos de Saude") — not "HP: 175" as originally
// assumed.
const HP_PATTERNS: readonly RegExp[] = [/(\d+)\s*\/\s*\d+\s*(?:HP|PS)/i, /HP\s*[:\s]?\s*(\d+)/i];
```

Esse tipo de bug não aparece em teste unitário com string inventada. Aparece quando você aponta o app pra uma tela de verdade, em português.

## Onde tá agora, e o próximo passo

O PTC está em **v1.0 Beta** (`1.0.0-beta.1`, versionCode 2), em teste fechado com amigos, com 34 de 36 features marcadas como prontas. O APK release é standalone: instala e abre, sem PC, sem Metro, sem `adb reverse`. O backend está no ar no free tier do Render.

O que **não** está pronto, e eu prefiro escrever antes que alguém descubra:

- A janela flutuante mostra hoje uma linha curta (espécie, CP, IV, dica). **Os resultados mais profundos ainda vivem numa tela dentro do app** — um toque de distância, porque o overlay é clicável e traz o PTC pra frente. Renderizar tudo dentro da janela é o próximo passo real.
- A captura ao vivo foi verificada ponta a ponta **no emulador**. No aparelho físico, o que já rodou de verdade foram as telas do app e o Professor Mode.
- A knowledge base que aterra a IA cobre **251 espécies (Gen 1+2)**, e só com os campos estruturados do PokeAPI. Expandir gerações e buscar fatos mais ricos é a maior peça de valor que sobrou.
- O backend no free tier do Render **dorme depois de 15 minutos sem uso** — a primeira requisição depois disso leva uns 30 segundos pra acordar. Migrar pra Railway ou Fly.io resolve, está anotado como follow-up.
- Sync entre dispositivos tem schema (`Trainer`, `SavedTeam`) e nenhum endpoint. Está travado em credencial de OAuth que eu preciso criar no Google Cloud Console.

No próximo capítulo eu entro no módulo nativo: `TYPE_APPLICATION_OVERLAY`, o fluxo de consentimento do `MediaProjection`, e três bugs que só existem em Android de verdade — incluindo um `CalledFromWrongThreadException` que me custou uma noite e um `IllegalStateException` que exige registrar um callback *antes* de criar o `VirtualDisplay`.
