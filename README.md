<div align="center">
  <h1>🧬 TFT Placement DNA</h1>
  <p><strong>Compare seus Top 4 e Bottom 4 para descobrir padrões recorrentes nas partidas recentes de Teamfight Tactics.</strong></p>
  <p><img alt="Status" src="https://img.shields.io/badge/status-MVP%20em%20valida%C3%A7%C3%A3o-64748b"></p>
</div>

## A ideia

**Placement DNA** divide as partidas recentes de TFT em dois grupos: **Top 4 (1º–4º)** e **Bottom 4 (5º–8º)**. Em seguida compara a frequência de unidades, composições e augments, procurando diferenças que possam ajudar a decidir o que revisar.

É uma análise **pessoal da amostra**, não um sistema de previsão ou uma tier list global.

## Métricas e sinais

| Comparação | Leitura |
| --- | --- |
| Top 4 x Bottom 4 | Distribuição de colocações da amostra |
| Traits e composições | Presença em cada grupo |
| Unidades | Frequência por faixa de colocação |
| Augments | Diferença entre grupos |
| Relevância | Diferença em pontos percentuais |
| Tamanho da amostra | Quantidade de ocorrências e indicação de confiança |

O MVP filtra sinais fracos: o elemento precisa aparecer em pelo menos duas partidas e mostrar uma diferença relevante. Mesmo assim, **a amostra pode ser insuficiente para conclusões generalizáveis**.

## Consultar e interpretar

1. Pesquise seu Riot ID e região.
2. Escolha 7 dias, 30 dias ou Set.
3. Veja resultados, distribuição e elementos recorrentes.
4. Compare os grupos e examine a quantidade de partidas usada.

Os dados vêm da integração gamer `riot-legacy-tft-profile`; podem estar incompletos por disponibilidade, período ou rate limit. O frontend não deve conter a Riot API key.

> **Correlação não é causalidade:** patch, lobby, itens, posicionamento, economia e ações durante o jogo afetam o resultado.

## Executar localmente

```bash
git clone https://github.com/HelioConde/tft-placement-dna.git
cd tft-placement-dna
python -m http.server 8000
```

Abra `http://localhost:8000`. Para checagens:

```bash
npm install
npm run check
npm run test:e2e
```

## Situação e próximos passos

**MVP implementado, em validação com usuários e dados reais adicionais.** Conferir contas com pouco histórico, ausência de traits/augments, resultados mobile e disponibilidade do backend antes de anunciar lançamento amplo.

[**Documentação técnica e QA anterior**](docs/README_HISTORY_2026-10-25.md) · [**Projetos do Ideias IA Lab**](https://github.com/HelioConde/ideias-ia-lab)

Não oficial, independente da Riot Games. Criado por [Hélio Conde](https://github.com/HelioConde).
