# TFT Placement DNA

Perfil pessoal de colocação em Teamfight Tactics baseado no histórico recente do próprio jogador.

## Estado atual

> **MVP funcional implementado em 07/10/2026.** O produto entra agora em validação real; novas features ficam congeladas até o gate fechar.

## Proposta

O Placement DNA divide sua amostra em:

- **Top 4**: colocações 1–4;
- **Bottom 4**: colocações 5–8.

Depois compara frequência de:

- comps/traits;
- unidades;
- augments.

Cada diferença mostra:

- taxa no Top 4;
- taxa no Bottom 4;
- diferença em pontos percentuais;
- direção do padrão;
- confiança da amostra.

## Regra de interpretação

**Correlação pessoal não é causalidade.**

Se um elemento aparece mais no Top 4, isso não prova que ele causou uma colocação melhor. Patch, lobby, itens, posicionamento, economia, estágio e decisões alteram o resultado.

O MVP só mostra diferenças recorrentes quando o elemento aparece em pelo menos duas partidas e a diferença absoluta é relevante.

## Métricas

- partidas;
- colocação média;
- Top 4%;
- vitórias;
- distribuição 1º–8º;
- nível médio quando disponível;
- ouro final médio quando disponível;
- comps/unidades/augments por faixa;
- histórico usado na leitura.

## Períodos

- 7 dias;
- 30 dias;
- Set atual.

## Backend

`riot-legacy-tft-profile` no backend gamer.

O frontend não possui chave Riot.

## Idiomas

- PT-BR principal;
- EN obrigatório;
- deep link preserva idioma, Riot ID, servidor e período.

## QA

Automação cobre:

- payload TFT controlado;
- Top 4 vs Bottom 4;
- direção positiva/negativa;
- diferença percentual;
- confiança da amostra;
- distribuição 1º–8º;
- 7D/30D/Set;
- 404/rate limit/validação;
- PT-BR/EN;
- deep link;
- desktop/mobile;
- Live Riot Smoke com `AlchemyFlames#BR1`.

```bash
npm install
npm run check
npm run test:e2e
```

## Gate antes de V2

- [x] MVP navegável;
- [x] Riot backend;
- [x] análise Top 4/Bottom 4;
- [x] confiança da amostra;
- [x] PT-BR/EN;
- [x] QA/E2E;
- [x] Pages preparado;
- [x] Live Riot Smoke;
- [ ] confirmar QA/Pages verdes;
- [ ] confirmar payload real com AlchemyFlames#BR1;
- [ ] validar 3+ Riot IDs/regiões;
- [ ] revisar contas com histórico pequeno;
- [ ] revisar casos sem traits/augments/level/gold;
- [ ] corrigir somente P0/P1.

## V2 — depois da validação

- evolução por patch;
- comparação entre períodos;
- separar 1º / 2–4 / 5–6 / 7–8;
- padrões de economia/nível quando a telemetria permitir;
- card compartilhável;
- notas pessoais;
- comparação com o próprio histórico anterior.

## Compliance

Produto independente e não endossado pela Riot Games. Teamfight Tactics e Riot Games são marcas de seus respectivos titulares.
