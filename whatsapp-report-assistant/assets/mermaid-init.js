'use strict';

function prepareDiagrams() {
  const diagrams = [];
  for (const figure of document.querySelectorAll('.prose .diagram')) {
    const template = figure.querySelector('template.diagram-source');
    const source = template?.content.querySelector('code.language-mermaid');
    if (!source) continue;
    const node = document.createElement('div');
    node.className = 'mermaid';
    node.textContent = source.textContent;
    const loading = figure.querySelector('.diagram-loading');
    if (loading) loading.remove();
    template.replaceWith(node);
    figure.setAttribute('aria-busy', 'true');
    diagrams.push({ figure, node });
  }
  return diagrams;
}

function showFailure({ figure, node }) {
  figure.removeAttribute('aria-busy');
  figure.classList.add('diagram-error');
  node.replaceChildren();
  const note = document.createElement('p');
  note.className = 'diagram-error-note';
  note.textContent = 'Não foi possível renderizar este diagrama. O conteúdo textual do capítulo continua disponível.';
  figure.append(note);
}

async function renderDiagrams() {
  const diagrams = prepareDiagrams();
  if (!diagrams.length) return;
  if (!window.mermaid) {
    for (const diagram of diagrams) showFailure(diagram);
    return;
  }

  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
    themeVariables: {
      darkMode: true,
      background: '#1c1825',
      primaryColor: '#302343',
      primaryTextColor: '#f2edf7',
      primaryBorderColor: '#a980ec',
      lineColor: '#bdafd0',
      secondaryColor: '#26374c',
      tertiaryColor: '#25202f',
      fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
      fontSize: '15px',
      edgeLabelBackground: '#1c1825',
      clusterBkg: '#251d33',
      clusterBorder: '#6f5587',
      actorBkg: '#302343',
      actorBorder: '#a980ec',
      actorTextColor: '#f2edf7',
      actorLineColor: '#bdafd0',
      signalColor: '#bdafd0',
      signalTextColor: '#f2edf7',
      labelBoxBkgColor: '#26374c',
      labelBoxBorderColor: '#809bd0',
      labelTextColor: '#f2edf7',
      loopTextColor: '#f2edf7',
      noteBkgColor: '#3b2d23',
      noteTextColor: '#f2edf7',
      noteBorderColor: '#d2a35d',
      activationBkgColor: '#302343',
      activationBorderColor: '#a980ec'
    },
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis', padding: 16 },
    sequence: { useMaxWidth: true, mirrorActors: false, wrap: true, width: 170, actorMargin: 30, diagramMarginX: 12, diagramMarginY: 12 }
  });

  for (const diagram of diagrams) {
    try {
      await window.mermaid.run({ nodes: [diagram.node] });
      diagram.figure.removeAttribute('aria-busy');
      diagram.figure.classList.add('diagram-ready');
    } catch (error) {
      console.error('Falha ao renderizar diagrama Mermaid:', error);
      showFailure(diagram);
    }
  }
}

renderDiagrams().catch(error => {
  console.error('Falha ao iniciar os diagramas Mermaid:', error);
});
