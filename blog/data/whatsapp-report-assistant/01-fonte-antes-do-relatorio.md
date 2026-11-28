Todo mês eu repetia o mesmo trabalho: exportava a conversa, juntava fotos e legendas e tentava descobrir a qual atendimento cada atualização pertencia. Foi daí que surgiu a ideia da Central de Chamados.

## Guardar antes de interpretar

O coletor arquiva a fonte antes de mandar o texto para análise. Mensagens, mídias e contexto têm papéis diferentes. Quando um registro é vinculado a um chamado, consigo voltar ao que foi enviado e conferir de onde saiu cada informação.

A IA local ajuda a interpretar o texto, mas não tem a última palavra. Uma foto mostra o que foi fotografado; um teste indica o que foi medido; nenhum dos dois, sozinho, prova que o atendimento terminou. Uma atualização pode acrescentar contexto e deixar o chamado em espera.

## A fila faz parte do produto

Se o computador reinicia no meio de um trabalho, o coletor precisa saber o que já processou, o que ficou pendente e qual confirmação já existe. A persistência no SQLite evita tratar cada reinício como um começo do zero. Também ajuda a separar indisponibilidade temporária de falta real de informação.

O que esse recorte entrega é um histórico revisável para preparar o relatório. O documento continua sendo conferido por quem entende o atendimento. Na [demonstração](https://leodah20.github.io/runavolt-blog-publico/demonstracao/), dá para ver o fluxo com dados fictícios.
