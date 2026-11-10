Todo mês eu tinha um trabalho que não aparecia no relatório: exportar a conversa do grupo, separar fotos de legendas, descobrir qual atualização pertencia a qual atendimento e perguntar de novo o que não tinha ficado claro. A informação já tinha passado pelo WhatsApp. Mesmo assim, na hora de fechar o documento, eu precisava reconstruir o caminho inteiro.

A ideia foi colocar um assistente nesse fluxo. Não para sair escrevendo que tudo foi resolvido, mas para guardar as fontes enquanto o trabalho acontece e perguntar quando falta contexto.

Essa diferença parece pequena. Na prática, definiu a arquitetura inteira.

## O que eu queria automatizar primeiro

Uma foto de um equipamento não conta a ocorrência inteira. Uma tela mostrando que um dispositivo responde na rede também não prova que ele voltou a funcionar no sistema que depende dele. E uma troca registrada sem desfecho não me autoriza a escrever que o chamado terminou.

Se eu entregasse tudo para um modelo e pedisse "gere o relatório", o texto poderia ficar bonito e tecnicamente errado. Eu precisava de um caminho que mantivesse a dúvida visível.

O fluxo que implementei ficou assim: receber a mensagem, guardar a fonte, reunir o contexto próximo, identificar o que está explícito e perguntar o que ainda muda a descrição. Só depois vem o trabalho de redigir o relatório.

Hoje essa primeira parte já funciona. A geração automática do documento final ainda não está implementada. Não vou chamar um arquivo de mensagens de gerador mensal só porque ele tem uma IA no meio.

## Quem chama quem

O processo principal é Node.js. Ele usa `whatsapp-web.js` com uma sessão própria do Chrome, vinculada manualmente à conta existente. Os eventos chegam ao coletor, passam pelo filtro do grupo autorizado e vão para um arquivo SQLite.

A análise textual fica em outro processo: Ollama com Qwen3 4B, rodando localmente. O coletor chama a API local, recebe uma proposta em JSON e valida se os trechos apontados realmente existem nas fontes. O modelo não tem ferramenta de terminal, acesso livre ao computador ou permissão para mandar mensagens por conta própria.

```text
WhatsApp → sessão Chrome → coletor Node.js → arquivo SQLite
                              ↓                   ↑
                         fila durável → assistente textual
                                            ↕
                                       Ollama / Qwen3

pergunta controlada ← aplicação ← campos que faltam
resposta vinculada  → chamado   → confirmação persistida
```

O painel de operação é uma página local. Ele permite pausar, consultar e acompanhar a retomada; não precisa ficar aberto. Há também um servidor MCP somente de leitura para consultar o arquivo pelo Codex. Esse é outro caminho: quando uso essa consulta, o material lido entra no contexto do modelo do Codex. Não é correto dizer que esse uso também é processamento exclusivamente local.

A [documentação interativa da arquitetura](/docs/whatsapp-report-assistant/) mostra as chamadas e os três fluxos principais. O que está público foi sanitizado. Código operacional, mensagens, imagens, sessão e credenciais continuam fora da publicação.

## A decisão importante foi guardar antes de interpretar

O modelo local leva tempo. Em dois testes curtos, a extração levou aproximadamente 40 e 60 segundos. Isso não é um benchmark geral, mas já foi suficiente para deixar claro que eu não podia depender da IA responder rápido para continuar recebendo registros.

Separei arquivamento e análise com uma fila durável. A mensagem é guardada e recebe uma entrega pendente; a interpretação vem depois. Se o processo cair, a fonte continua lá.

A fila tem estados simples: `pending`, `processing` e `done`. O ID original da mensagem é a chave para evitar que a mesma fonte entre duas vezes:

```sql
INSERT OR IGNORE INTO recovery_jobs(id, ts, state)
VALUES (?, ?, 'pending');
```

O ganho não está em ter uma tabela com nome de fila. Está em conseguir distinguir "recebi e guardei" de "já interpretei". Isso evita transformar uma demora ou falha da IA em perda silenciosa do registro.

Na criação de um chamado, a gravação dele e a marcação das fontes consumidas ficam na mesma transação. Sem isso, uma queda entre as duas operações poderia deixar um chamado salvo e as fontes ainda pendentes, prontas para virar outro chamado depois do reinício.

## A pergunta precisa voltar ao lugar certo

Quando falta informação, a aplicação monta uma pergunta identificada como assistente e com um código do chamado. A pessoa pode citar a mensagem ou usar o código na resposta.

Não uso proximidade de horário como autorização para jogar uma resposta em qualquer atendimento parecido. Foto seguida de legenda pode ajudar a reunir contexto, mas responder a uma dúvida precisa ter um vínculo rastreável. Esse vínculo continua existindo mesmo quando o registro já tem informações completas e recebe uma nova atualização.

O texto da pergunta é controlado pela aplicação. O modelo propõe agrupamentos e extrai trechos; não decide livremente para quem enviar uma mensagem. Também há pausa e limites de envio.

E tem uma regra que eu não quero perder no caminho: **atualizar as informações de um chamado não significa confirmar que o equipamento foi reparado**. Se a resposta só permite registrar uma pendência, é isso que fica registrado.

## O bug mais útil não foi da IA

Na primeira implantação das confirmações, eu já tinha enviado duas respostas para dois chamados. As duas foram processadas, mas só uma recebeu o aviso de confirmação: o mecanismo tinha sido instalado depois que elas chegaram, e a validação inicial cobriu apenas uma.

Do ponto de vista do banco, os registros estavam lá. Do meu lado, parecia que o assistente tinha prestado atenção em um chamado e ignorado o outro. E eu não deveria precisar abrir um arquivo técnico para saber a diferença.

A correção foi adicionar uma conferência que percorre todos os chamados e suas respostas, não só os que ainda têm campos faltando. Cada confirmação tem um registro persistido por ID da resposta. Se já existe, não manda outra. Se faltou, entra no fluxo de envio.

O aviso também depende do que realmente aconteceu: depois da análise e da gravação, pode dizer que as informações foram atualizadas. Se a análise falhou, confirma apenas que a resposta foi recebida e vinculada, deixando a atualização como pendente.

Depois apareceu outro silêncio, de outra origem: a página interna do WhatsApp perdeu o frame, mas o processo continuou vivo e o painel ainda dizia "conectado". Não era uma escolha do modelo de não fazer perguntas; a fonte nova nem tinha chegado ao arquivo. Acrescentei uma verificação periódica do estado real da sessão para reconhecer esse tipo de falha e acionar a reconexão. Também passei a confirmar o registro de todo novo chamado, mesmo sem dúvida de contexto. Um processo existir não basta para dizer que o serviço está funcionando.

Tem um trade-off aqui: se a tentativa de envio tem resultado incerto, eu não repito automaticamente. A mensagem pode ter saído antes da falha no retorno. Preferi registrar a incerteza a duplicar perguntas e confirmações no grupo. Isso evita uma classe de erro, mas pode exigir conferência de entrega; não é uma promessa de entrega exatamente uma vez.

## E quando eu desligo o computador?

Essa pergunta apareceu assim que o coletor começou a funcionar. A resposta honesta é: com o PC desligado, não tem processo local recebendo e interpretando mensagens.

Ao ligar e entrar no Windows, o lançador inicia os processos em segundo plano e reutiliza a sessão, se ela ainda estiver válida. A recuperação busca o histórico disponibilizado pelo WhatsApp desde o último ponto confirmado, com uma sobreposição de 120 segundos. O ID original evita duplicar o que já passou.

O checkpoint só avança depois de conferir a busca e guardar as fontes e suas entregas na fila. A recuperação também atravessa meses: desligar em um mês e voltar no seguinte não pode significar consultar apenas o mês atual e esquecer o intervalo anterior.

Isso não recupera por mágica uma mídia expirada ou uma mensagem que o WhatsApp não disponibilizar. Também não elimina a necessidade de um novo QR se a sessão for revogada. A retomada foi testada reiniciando o coletor pelo mesmo lançador usado no login; eu não reiniciei o Windows inteiro nesse teste.

## Local não é sinônimo de risco zero

O arquivo usa AES-256-GCM, com uma chave própria no cofre do Windows. Conteúdos e anexos são cifrados, mas IDs, datas e estados de fila continuam no índice. O perfil do Chrome não tem a mesma garantia de criptografia do arquivo, e processos com acesso à mesma conta do Windows seguem sendo uma fronteira de confiança.

Outro limite importante: vincular o WhatsApp Web dá alcance técnico sobre a conta inteira. Arquivar só um grupo é uma restrição da aplicação, não uma permissão por grupo fornecida pelo WhatsApp. A biblioteca é não oficial e pode quebrar com mudanças do serviço; também existe risco de bloqueio.

Por isso a documentação pública não leva mensagens de trabalho, nomes de clientes, IDs de grupo ou credenciais. O que está sendo mostrado aqui é o desenho e suas decisões, não uma cópia do ambiente operacional.

## Onde está agora

O coletor já arquiva fontes e mídias, a IA textual pede contexto, respostas são ligadas ao chamado, confirmações são persistidas e a retomada automática está ativa. Há 56 testes sintéticos aprovados cobrindo fila após queda, viradas de mês, pausas, duplicatas, confirmações e falhas de transporte. Envios reais, respostas e reinício do coletor também foram verificados. Teste sintético e uso real são evidências diferentes; um não substitui o outro.

Ainda faltam o relatório final DOCX/PDF automático, interpretação visual das fotos e transcrição de áudio. Também não existe conversa livre pelo WhatsApp como em um chat geral de IA.

O próximo passo não é colocar mais autonomia por colocar. É levar esse arquivo de fontes e esclarecimentos até um rascunho mensal que continue permitindo conferir de onde veio cada afirmação. Sem inventar teste, causa ou conclusão para completar um parágrafo.
