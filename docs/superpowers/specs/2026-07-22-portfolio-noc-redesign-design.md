# Redesign do portfólio — conceito "NOC Dashboard"

Data: 2026-07-22
Status: aguardando revisão do usuário

## Contexto e objetivo

O site atual (`leodah20.github.io`) é estático (HTML/CSS/JS puro, sem framework, sem
build step, hospedado no GitHub Pages) com um visual tipo terminal monoespaçado e
toggle claro/escuro. O usuário considera o resultado "texto HTML cru": pouco visual,
pouco interativo, e reclama especificamente do desperdício de espaço horizontal em
telas largas (coluna de conteúdo com `max-width: 820px` centralizada, deixando vãos
vazios enormes dos dois lados).

Objetivo: reformular a identidade visual do site para algo mais visual, interativo e
divertido de explorar, mantendo o formato estático sem dependências externas, e
resolvendo o problema do espaço desperdiçado em telas largas. O redesign deve ligar a
linguagem visual à identidade profissional real do usuário (Analista de Redes Jr.),
sem virar gimmick sem funcionalidade.

## Conteúdo (fonte da verdade)

`js/content.js` já contém conteúdo real mais rico que o brief original enviado pelo
usuário; onde havia divergência entre os dois, o usuário confirmou explicitamente qual
prevalece (ver abaixo). Certificações foram checadas contra os PDFs reais na pasta
`G:\Meu Drive\Certificados\` fornecida pelo usuário.

### Identidade / hero

- Nome: mantido "Leonardo Cordeiro Sutil" (confirmado pelos certificados reais).
- Cargo atual: **Analista de Redes Jr.** na Build Engenharia (era "Estagiário em
  Infraestrutura de TI e Automação Predial" no arquivo antigo — atualizado).

### Experiência — Build Engenharia (progressão confirmada pelo usuário)

Um único bloco de experiência com duas posições empilhadas, mostrando a progressão real:

1. **Estagiário em Infraestrutura de TI e Automação Predial** — set. 2025 – jul. 2026
2. **Analista de Redes Jr.** — jul. 2026 – atual (promoção em 14/07/2026)

Descrição das três frentes de atuação (servidores, redes corporativas, automação
predial/segurança) permanece a mesma já existente em `content.js`, associada ao bloco
combinado.

Demais experiências (Subway, Lemos e Lemos, Incubadora Tecnológica UTFPR) e educação
(UNIP) permanecem inalteradas — sem divergência encontrada.

### Skills — adições confirmadas pelo usuário

Categorias existentes recebem estes itens novos (todos confirmados como reais pelo
usuário, ou evidenciados por certificado):

- **redes**: + Cabeamento estruturado, + Cisco Packet Tracer (confirmado por
  certificado "Começando com o Cisco Packet Tracer")
- **servidores_e_virtualizacao**: + Active Directory
- **seguranca_e_firewall**: + VPN, + Hardening básico
- **linguagens_e_dev**: + Bash

Nota de auto-revisão: o brief original também citava "roteamento" como skill de rede.
Já há evidência indireta disso em `content.js` (equipamento "Roteadores MikroTik" nas
descrições de experiência), mas isso não foi confirmado explicitamente pelo usuário
como item de lista de skills — irá aparecer como proposta de adição na revisão do
usuário desta spec, não é uma decisão fechada.

### Certificações — reorganizadas em duas camadas

**Featured (3 — LED aceso / destaque visual forte, confirmado pelo usuário):**

| Certificado | Emissor | Data |
|---|---|---|
| AWS Educate: Introduction to Generative AI | Amazon Web Services | mar. 2025 |
| Conceitos Básicos de Redes | Cisco Networking Academy | 22 mai. 2026 |
| Treinamento Invenzi W-Access | Invenzi | 18 mai. 2026 (válido até 18/06/2028) |

**Regular (LED apagado / entrada padrão):**

| Certificado | Emissor | Data |
|---|---|---|
| Começando com o Cisco Packet Tracer | Cisco Networking Academy | 16 abr. 2026 |
| Linux Essentials | Cisco Networking Academy (NDG) | 22 mai. 2026 |
| Linux Unhatched | Cisco Networking Academy (NDG) | 22 mai. 2026 |
| C++ Essentials 1 | Cisco Networking Academy (C++ Institute) | 27 mai. 2026 |
| EF SET English Certificate — 75/100, C2 Proficient | EF SET | 22 set. 2021 |
| Fundamentos de HTTP para Desenvolvedores | LinkedIn Learning | 03 abr. 2025 |
| Introdução à Cibersegurança com o Santander | Santander Brasil | abr. 2025 |
| Segurança da Informação e a Proteção de Dados nos Dias Atuais (palestra) | UNIP | 21 out. 2024 |
| Integrando Inteligência Artificial nas Empresas (palestra) | UNIP | 31 out. 2024 |

Correção de dados: **Linux Unhatched** estava rotulado incorretamente no arquivo atual
como emissor "LinkedIn Learning" sem data. O certificado real confirma emissor **Cisco
Networking Academy**, concluído em 22 mai. 2026.

**Excluídos deliberadamente** (decisão do usuário — não combinam com a narrativa de
rede/infra ou são numerosos demais): os 11 cursos da Alura (Excel, Power BI, ChatGPT,
engenharia de prompt), Oficina de Arduino, SEBRAE "Empreenda Rápido", Certificação LEED
Gold, "5ª Semana Acadêmica", "Relações Comunitárias", as palestras extras de IA
("Desafios da Privacidade..." e "Inteligência Artificial - Potencializando..."), e "Know
the OS".

### Projetos e contato

Sem alterações de conteúdo — `ecofuturo` e `chatbot-front` com os mesmos links e
descrições já presentes em `content.js`; lista de contato (github, linkedin, blog,
email) mantida como está.

Confirmado: ignorar completamente o repositório `smc-portfolio` (não mencionar), e não
linkar o próprio repositório do site em nenhum lugar.

## Direção visual (validada com mockups na sessão)

### Conceito: "NOC Dashboard"

O site inteiro assume a linguagem visual de um painel de operações de rede (estilo
Zabbix/Grafana), reaproveitando elementos que já fazem parte do dia a dia profissional
do usuário:

- **Skills → diagrama de topologia interativo (SVG).** Nó central "você" conectado a
  nós de categoria (redes, servidores, segurança, dev). Clicar num nó marca-o com anel
  âmbar (estado selecionado) e atualiza um painel adjacente com a lista de skills
  daquela categoria. Rótulos de texto ficam **abaixo** de cada nó com espaço reservado
  (correção feita durante o brainstorming — nos primeiros mockups os rótulos
  transbordavam por cima do nó).
- **Projetos → cards estilo "host" de monitoramento.** Cada projeto real é exibido como
  um host monitorado: nome, indicador "● online", descrição curta, tags de stack, e
  links (demo/source) no rodapé do card.
- **Certificações → "LED wall".** As 3 featured aparecem como cards maiores com LED
  aceso (brilho); as demais aparecem como badges compactos em grade/wrap com um
  indicador de LED apagado — evita virar uma lista longa de texto simples.
- Linguagem de terminal/CLI (prompt, chrome de janela com os três pontos
  vermelho/amarelo/verde) é mantida como fio condutor visual entre as seções, ligando
  ao site atual em vez de romper totalmente com ele.

### Paleta: "Console Elevado"

Evolução (não substituição) da paleta atual, mais rica e proposital:

- Fundo quase preto com leve matiz azul-esverdeada (`~#0c1210` base, `~#101d19`
  elementos elevados/cards).
- Acento primário: teal/ciano aprofundado (família `#5eead4`), usado para elementos de
  "dados/sinal" (nó central do diagrama, prompt, links).
- Acento secundário: âmbar (família `#f5a623`), reservado para "atual/selecionado/em
  destaque adjacente" (badge de cargo atual, nó selecionado no diagrama).
- Acento terciário: **violeta (família `#a78bfa`), reservado exclusivamente para
  certificações** (LEDs e badges) — distingue visualmente "credencial" de "status".
- Verde (`#3ddc84`) para status "online" dos hosts/projetos, mantendo a convenção atual
  de dots vermelho/amarelo/verde no chrome das janelas.
- Tema claro: mesma lógica de acentos, sobre fundo claro frio (não o creme/branco
  genérico atual — a definir tonalidade exata na implementação, mantendo contraste
  AA/AAA). Toggle claro/escuro é mantido.

### Layout e navegação: sidebar fixa estilo NOC

- Sidebar fixa à esquerda em telas desktop/tablet largo, com ícone + label por seção
  (whoami, skills, certifications, projects, contact) e um dot de status colorido por
  seção (cor = acento daquela seção). Toggle de tema fica fixado na base da sidebar.
- Isso resolve diretamente a reclamação do usuário sobre espaço vazio: a área de
  conteúdo passa de `max-width: 820px` para algo em torno de **1100–1200px**, com grid
  de múltiplas colunas dentro de cada seção (ex: diagrama de topologia + painel de
  detalhe lado a lado; cards de projeto em grade de 2 colunas; LEDs de certificação em
  linha de 3 + grade de badges abaixo).
- Fundo com textura decorativa sutil (grid/pontos de rede) fora da área de conteúdo,
  para telas ultra-largas não ficarem com vazio chapado.
- Responsivo: em telas médias a sidebar vira uma trilha só de ícones; em mobile vira
  barra superior horizontal (evolução do nav atual, que já funciona bem em mobile). O
  diagrama de topologia simplifica para uma lista vertical empilhada de categorias em
  telas pequenas, para continuar legível.

### Sem dependências externas

Continua HTML/CSS/JS puro, sem build step, sem framework, sem bibliotecas externas
(diagrama feito com SVG inline, sem lib de gráficos). Fonte JetBrains Mono mantida.

## Escopo técnico

Arquivos afetados:

- `index.html` — nova estrutura de markup (sidebar, diagrama, host cards, LED wall).
- `css/style.css` — nova paleta, novo layout de grid, componentes novos
  (`.topology`, `.host-card`, `.cert-led`, `.sidebar`), responsividade.
- `js/content.js` — atualização de conteúdo conforme detalhado acima (cargo, bloco de
  experiência com progressão, skills novas, certificações reorganizadas em
  featured/regular).
- `js/main.js` — lógica de renderização nova (diagrama clicável, host cards, LED wall,
  navegação por sidebar, toggle de tema realocado).
- `README.md` — atualizar instruções de edição de conteúdo se o formato de
  `content.js` mudar de forma que afete quem for editá-lo depois.

Fora de escopo: qualquer backend, build step, framework, ou dependência externa nova;
qualquer menção ao repositório `smc-portfolio` ou ao próprio repo do site.

## Auto-revisão da spec

- **Placeholders**: nenhum campo ficou marcado como TBD — todas as datas/fatos
  incertos foram resolvidos com o usuário ou verificados contra certificados reais,
  exceto a nota sobre "roteamento" como possível skill adicional (sinalizada acima,
  não bloqueante).
- **Consistência interna**: paleta, conceito visual e layout foram validados juntos
  no mockup composto final (aprovado pelo usuário) — não há contradição entre as
  seções.
- **Escopo**: focado a um único ciclo de implementação (redesign completo do site
  estático existente); não requer decomposição em sub-projetos.
- **Ambiguidade**: comportamento responsivo do diagrama de topologia e da sidebar em
  telas pequenas está descrito em termos de intenção ("lista vertical empilhada",
  "trilha de ícones") — os detalhes exatos de breakpoint ficam para o plano de
  implementação, não para esta spec de design.
