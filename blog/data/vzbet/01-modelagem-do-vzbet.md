Em um bolão de futebol de várzea, a discussão geralmente vem depois do jogo: quem palpitou a tempo, quem acertou e como isso mudou o ranking. Eu quis modelar essas regras sem envolver dinheiro, carteira ou pagamento.

## A regra fica fora da interface

O banco precisa representar campeonatos, partidas, participantes e palpites. O contexto importa: o resultado de um jogo só pode pontuar os palpites ligados àquele jogo, e o horário da partida define a janela de participação.

A comparação de placares foi isolada em uma função que recebe o palpite e o resultado. Assim consigo testar o caso exato, o errado e as combinações sem subir o frontend ou conectar ao banco. A versão estudada aqui trata palpites simples e múltiplos de forma diferente.

## O ranking não pode ficar pela metade

Se a partida é finalizada, o resultado e a atualização de pontos precisam permanecer coerentes. A ideia do caso de uso é calcular os pontos e registrar o fechamento de forma atômica. Se uma etapa falhar, o ranking não deve mostrar metade da rodada. Também é preciso tratar a repetição da operação para impedir que o mesmo jogo pontue duas vezes.

O recorte que ficou documentado é de modelagem e lógica de domínio, usando NestJS, Prisma e PostgreSQL com um frontend React. Não é uma operação de apostas nem um serviço hospedado que eu ofereça.
