# PROMPT PARA DASHBOARD — FOURTH COMPANY / RM DIGITAL

Cole este prompt diretamente no claude.ai (ou em um novo Project) junto com os dois arquivos Excel anexados.

---

## CONTEXTO DO NEGÓCIO

Você é um analista de dados especializado em marketing digital e CRM. Vou te fornecer dois arquivos Excel:

1. **`Fourth_Company.xlsx`** — CRM de leads da RM Digital, com dados mensais de **Setembro/2025 a Maio/2026**, totalizando ~7.600 leads. Cada linha é um lead com os campos: Data, Lead (ID), Nome, Telefone, Email, Investimento (faixa de capital declarado), Origem, Status, Anotações, Nome do Anúncio.

2. **`Relatório-sem-título...xlsx`** — Relatório do Meta Ads com dados mensais das campanhas pagas de **Set/2025 a Mai/2026** (total investido: ~R$150.085). Contém: Nome da campanha, Mês, Resultados (leads gerados), Valor usado (BRL), CPM, CPC, CTR, Impressões, Cliques, etc.

---

## LÓGICA DE NEGÓCIO — LEIA COM ATENÇÃO

### Mapeamento de Origens dos Leads (CRM → Meta Ads)

A coluna **Origem** no CRM indica de onde veio o lead. As origens do Meta Ads são:

| Origem no CRM | Campanha no Meta Ads | Descrição |
|---|---|---|
| `respondi` | `rm_leadads` | Lead veio pelo Respondi (chatbot/WhatsApp), tráfego pago pelo Meta |
| `forms-meta` | `rm_leadads` ou `rm_consolidado` | Lead veio pelo formulário nativo do Meta (Lead Ads) |
| `meta` | `rm_leadads` | Lead clicou no anúncio e foi direto ao site |
| `ig` | Meta Ads (Instagram) | Lead orgânico ou pago pelo Instagram |
| `fb` | Meta Ads (Facebook) | Lead via Facebook |
| `google` | Google Ads (não está no relatório Meta) | Lead via Google |
| `chatgpt.com` | Orgânico/referral | Não é pago |

**Regra de negócio crítica:** As 3 origens pagas do Meta (`respondi`, `forms-meta`, `meta`) correspondem à campanha `rm_leadads` e/ou `rm_consolidado`. A campanha `rm-canton-fair` gerou registros no site (não leads no CRM). A campanha `rm-mentoria` não gerou leads.

### Mapeamento de Status — Categorias de Qualidade

Agrupe os status em categorias para análise de qualidade:

| Categoria | Status incluídos | Cor sugerida |
|---|---|---|
| ✅ **Convertido** | `Fechamento`, `Assistencia` | Verde escuro |
| 📅 **Reunião** | `Reunião ` | Verde |
| 🔄 **Em andamento** | `Em contato`, `Follow up`, `contato feito` | Azul |
| ⏳ **Potencial** | `Não é o timing`, `tentativa de contato` | Amarelo |
| 💸 **Baixo Investimento** | `Investimento Baixo` | Laranja |
| 🚫 **Sem Resposta** | `Sem resposta` | Vermelho claro |
| ❌ **Descartado** | `Sem interesse`, `Só especulando`, `Achou que vendiamos`, `produto inviável`, `não quer pagar`, `Desistiu`, `Fechou com concorrente`, `No Show` | Cinza |
| 🔁 **Inválido** | `Duplicado`, `Numero Incorreto`, `Teste` | Cinza claro |

**Nota:** `Assistencia` e `Fechamento` são tratados como a MESMA coisa — representam negócios fechados/clientes convertidos.

### Faixas de Investimento — Padronização

A coluna Investimento tem variações de texto que significam o mesmo. Normalize assim:

| Faixa Padronizada | Textos possíveis no CRM |
|---|---|
| R$70k – R$100k | "De R$ 70 mil a R$ 100 mil", "de 70 a 100 mil reais", "De R$ 70.000 a R$ 150.000" (aproximado) |
| R$100k – R$200k | "De R$ 100 mil a R$ 200 mil", "de 100 a 200 mil reais" |
| R$150k – R$250k | "De R$ 150.000 a R$ 250.000" |
| R$200k – R$300k | "De R$ 200 mil a R$ 300 mil", "de 200 a 300 mil reais" |
| Acima de R$250k | "Acima de R$ 250.000", "Acima de R$ 300 mil", "Acima de 300 mil reais" |

---

## DASHBOARD SOLICITADO

Crie um **dashboard interativo em React** (single file, sem dependências externas além de recharts) com as seguintes seções e análises:

---

### 📊 SEÇÃO 1 — VISÃO GERAL (KPIs no topo)

Cards com os seguintes indicadores calculados a partir de TODOS os meses:

- **Total de Leads** (excluindo Duplicados e Testes)
- **Total Convertidos** (Fechamento + Assistencia) com % do total
- **Total Reuniões** realizadas com % do total
- **Taxa de Sem Resposta** (% do total)
- **Taxa de Investimento Baixo** (% do total)
- **Total Investido no Meta** (soma do Valor usado BRL)
- **CPL Médio** (Custo por Lead = Total Meta / Total Leads Meta)
- **Custo por Fechamento** (Total Meta / Total Convertidos)

---

### 📈 SEÇÃO 2 — EVOLUÇÃO MENSAL

Gráfico de linha ou barras empilhadas mostrando, mês a mês (Set/25 → Mai/26):

- Volume total de leads por mês
- Leads por categoria de qualidade (Convertido, Reunião, Em andamento, Baixo Investimento, Sem Resposta, Descartado)
- Investimento Meta (R$) por mês (eixo secundário ou gráfico separado)
- CPL por mês (custo por lead Meta)

Permitir filtro por mês (toggle/checkbox).

---

### 🎯 SEÇÃO 3 — QUALIDADE DOS LEADS

#### 3A — Funil de Qualidade (gráfico funil ou barras horizontais)
Mostrar o funil de qualificação:
1. Total Leads recebidos
2. Válidos (sem Duplicado/Número Incorreto/Teste)
3. Contatados (Com algum status de contato real)
4. Em negociação (Em contato + Follow up + Reunião)
5. Convertidos (Fechamento + Assistencia)

#### 3B — Distribuição por Status (pizza ou donut)
Mostrar % de cada CATEGORIA (não status individual) no total geral.

#### 3C — Taxa de Conversão por Mês
Linha mostrando % de Convertidos mês a mês.

---

### 🔗 SEÇÃO 4 — ANÁLISE POR ORIGEM

Tabela + gráfico comparando as origens:

| Origem | Total Leads | % Convertidos | % Reunião | % Sem Resposta | % Inv. Baixo | Qualidade Score |
|---|---|---|---|---|---|---|

- **Agrupe** `respondi`, `forms-meta`, `meta` como sub-origens do Meta Ads
- Compare Meta Ads vs Google vs Orgânico
- Destaque qual origem tem MAIOR taxa de conversão e qual tem MAIOR taxa de sem resposta

---

### 💰 SEÇÃO 5 — INVESTIMENTO × RESULTADO

#### 5A — Faixa de Investimento dos Leads (barras)
- Distribuição de leads por faixa de capital (R$70k–100k, R$100k–200k, etc.)
- Com filtro de status para ver: "Quantos leads de alta fatura viraram clientes?"
- Destacar: leads com BAIXO INVESTIMENTO são problema? Qual faixa tem mais conversão?

#### 5B — Cruzamento: Origem × Faixa de Investimento (heatmap ou tabela colorida)
- Linha: Origem (respondi, forms-meta, meta, google)
- Coluna: Faixa de Investimento
- Valor: contagem de leads
- Insight: "Qual origem traz leads com maior capital?"

#### 5C — ROI do Meta Ads por Mês
Tabela mostrando por mês:
- Investimento Meta (R$)
- Leads gerados via Meta
- Convertidos via Meta
- CPL (Custo por Lead)
- Custo por Reunião
- Custo por Fechamento

---

### 📣 SEÇÃO 6 — ANÁLISE DOS ANÚNCIOS (Nome do Anuncio)

A coluna "Nome do Anuncio" segue o padrão: `m-[motivo]_h-[hook]_p-[público]_i-[influencer]_len-[duração]`

Extraia e analise:
- **Top 10 anúncios** por volume de leads
- **Top 5 anúncios** por taxa de conversão (Fechamento/total)
- **Top 5 anúncios** por taxa de reunião
- **Piores anúncios** por taxa de sem resposta

---

### 🔍 SEÇÃO 7 — FILTROS GLOBAIS

Painel de filtros que afeta todas as seções:
- **Período:** Seletor de mês(es) — toggle múltiplo
- **Origem:** Multi-select (respondi, forms-meta, meta, google, ig, fb)
- **Status/Categoria:** Multi-select das categorias de qualidade
- **Faixa de Investimento:** Multi-select

---

## INSTRUÇÕES TÉCNICAS

### Tecnologia
- React com hooks (useState, useMemo, useCallback)
- Recharts para gráficos
- Tailwind CSS para layout
- Single file .jsx

### Dados
Importe os dados diretamente no componente como constantes JavaScript (parse dos Excel e converta para JSON para incluir no código). Inclua todos os ~7.600 registros do CRM e os dados mensais do Meta Ads.

### Design
- Tema escuro profissional (fundo #0f172a, cards #1e293b)
- Cores de status: verde para Convertido, azul para Em andamento, amarelo para Potencial, laranja para Inv. Baixo, vermelho para Sem Resposta, cinza para Descartado
- Cards de KPI com ícones e variação percentual quando possível
- Gráficos com tooltips informativos em português
- Responsivo

### Qualidade
- Todos os cálculos de % com 1 casa decimal
- Valores monetários em R$ com separador de milhar
- Texto em Português brasileiro
- Tratamento de dados nulos/undefined

---

## DADOS PARA INCLUIR NO CÓDIGO

Quando for gerar o código, processe os arquivos Excel e inclua os dados já parseados como arrays JavaScript. A estrutura esperada:

```javascript
// CRM Data — cada objeto é um lead
const CRM_DATA = [
  { mes: "Maio - 2026", data: "2026-05-02", nome: "...", investimento: "R$70k-100k", origem: "respondi", status: "Sem resposta", categoria: "Sem Resposta", anuncio: "m-70%_economia_..." },
  // ...todos os ~7600 registros
];

// Meta Ads — cada objeto é uma campanha/mês
const META_DATA = [
  { campanha: "rm_leadads", mes: "2026-05", investimento: 9820.56, leads: 114, cpl: 86.14, impressoes: 206968, cliques: 2542 },
  // ...todos os registros
];
```

Mapeie a coluna "Origem" do CRM para identificar quais leads vieram do Meta Ads:
- `meta`, `respondi`, `forms-meta`, `ig`, `fb` → Meta Ads
- `google` → Google Ads
- Demais → Orgânico/Outros

---

## INSIGHTS ESPERADOS

O dashboard deve responder claramente:

1. **Qual a taxa de conversão real da operação?** (Fechamentos + Assistencias / Total válidos)
2. **Qual origem traz leads de MAIOR qualidade?** (respondi vs forms-meta vs meta direto)
3. **O investimento em baixo capital está desperdiçando orçamento?** (% de Investimento Baixo por origem)
4. **Qual mês teve melhor ROI?** (menor CPL + maior conversão)
5. **Qual anúncio converte mais?** (análise do Nome do Anuncio)
6. **A taxa de Sem Resposta está melhorando ou piorando?** (tendência mensal)
7. **Quanto custa cada fechamento via Meta Ads?** (Custo por Conversão real)

---

**IMPORTANTE:** Ao processar os arquivos, normalize os textos de Status e Investimento conforme as tabelas acima. Agrupe "Assistencia" e "Fechamento" como "Convertido". Exclua registros com Status vazio/nulo das análises de funil, mas mantenha-os no total geral.
