O problema que eu queria estudar era simples de descrever: consultar uma informação sem sair da tela do jogo, procurar uma captura na galeria e voltar. A parte interessante não era a fórmula, e sim como conseguir e interpretar a informação.

## Do frame ao contexto

O protótipo usa a captura autorizada pelo Android como entrada. O reconhecimento óptico de caracteres roda no aparelho: o OCR tenta extrair campos como espécie, CP e HP, e o aplicativo decide quais resultados consegue apresentar. Quando a pessoa pede uma análise complementar, a ideia é trabalhar com o texto extraído, em vez de mandar a imagem inteira.

Separar captura, reconhecimento e interpretação mostrou onde cada erro nasce. Se o texto veio incompleto do OCR, o backend não consegue garantir o que estava na imagem. O resultado precisa admitir dúvida, e uma troca de tela não deveria ser tratada como se fosse o mesmo contexto.

## O que o protótipo demonstrou

O estudo juntou React Native, código nativo Android e um backend em NestJS. O fluxo de captura foi verificado no emulador; no aparelho físico, os testes relatados no projeto abrangeram as telas do app e a função de consulta. Isso não equivale a validar todo o overlay em qualquer aparelho.

Encerrei o trabalho como protótipo de integração. Ficou o desenho do fluxo, o que cada parte resolve e o que o teste de cada uma não prova.
