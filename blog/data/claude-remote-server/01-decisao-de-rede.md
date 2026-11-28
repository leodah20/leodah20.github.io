Eu tinha um notebook parado e queria continuar um trabalho iniciado no computador quando estivesse longe da mesa. Usei essa ideia para estudar uma pergunta de rede: como chegar à máquina sem publicar o terminal na internet?

## A VPN muda o limite do acesso

Comparei hospedar o ambiente numa VPS, encaminhar uma porta SSH e aproveitar os equipamentos que já tinha. Na arquitetura que documentei, o roteador termina o WireGuard. Depois de passar pela VPN, o dispositivo autorizado chega ao notebook que roda o SSH.

Separar essas camadas ajuda a localizar problemas: a VPN estabelece o caminho, o SSH autentica a sessão e o tmux mantém o trabalho aberto quando a conexão do celular cai. O tmux não mantém a máquina ligada nem recupera uma sessão depois que o sistema é reiniciado.

## O que ficou do laboratório

O repositório reúne a topologia, exemplos de configuração e scripts para preparar a máquina e iniciar sessões. O trabalho ficou no nível de laboratório documentado: não foi uma implantação validada de ponta a ponta. Também não tratei a VPN como licença para liberar a rede inteira; chegar ao host necessário é um requisito diferente de enxergar tudo na LAN.

O aprendizado que levo para outros projetos é esse: identificar primeiro o serviço que precisa ser alcançado e só depois escolher até onde a rede deve dar acesso.
