/* RM Digital Dashboard — shared helpers, formatters, palettes */

// ============================
// Formatters (pt-BR)
// ============================
const fmtInt = (n) => {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('pt-BR').format(Math.round(n));
};
const fmtPct = (n, d = 1) => {
  if (n == null || isNaN(n)) return '—';
  return (n).toFixed(d).replace('.', ',') + '%';
};
const fmtMoney = (n, opts = {}) => {
  if (n == null || isNaN(n)) return '—';
  if (opts.short && n >= 1000) {
    return 'R$ ' + (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',') + 'k';
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
};
const fmtMoneyFull = (n) => {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
};

// ============================
// Domain enums (ordered)
// ============================
const MONTHS_ORDER = [
  '2025-09','2025-10','2025-11','2025-12',
  '2026-01','2026-02','2026-03','2026-04','2026-05'
];
const MONTH_LABEL = {
  '2025-09': 'Set/25', '2025-10': 'Out/25', '2025-11': 'Nov/25', '2025-12': 'Dez/25',
  '2026-01': 'Jan/26', '2026-02': 'Fev/26', '2026-03': 'Mar/26', '2026-04': 'Abr/26', '2026-05': 'Mai/26',
};
const MONTH_LABEL_FULL = {
  '2025-09': 'Setembro 2025', '2025-10': 'Outubro 2025', '2025-11': 'Novembro 2025', '2025-12': 'Dezembro 2025',
  '2026-01': 'Janeiro 2026', '2026-02': 'Fevereiro 2026', '2026-03': 'Março 2026', '2026-04': 'Abril 2026', '2026-05': 'Maio 2026',
};

const CATEGORIAS = [
  'Convertido', 'Reunião', 'Em andamento', 'Potencial',
  'Baixo Investimento', 'Sem Resposta', 'Descartado', 'Inválido'
];

const CATEGORIA_COLOR = {
  'Convertido':         '#0f7a3a',  // verde escuro
  'Reunião':            '#16a34a',  // verde
  'Em andamento':       '#037ff0',  // azul marca
  'Potencial':          '#d4a017',  // amarelo (escurecido p/ legibilidade)
  'Baixo Investimento': '#e07a00',  // laranja
  'Sem Resposta':       '#dc2626',  // vermelho
  'Descartado':         '#9aa3ad',  // cinza
  'Inválido':           '#ccd2d9',  // cinza claro
};
const CATEGORIA_DESC = {
  'Convertido':         'Fechamento + Assistência',
  'Reunião':            'Reunião realizada',
  'Em andamento':       'Em contato, Follow up',
  'Potencial':          'Tentativa, Não é o timing',
  'Baixo Investimento': 'Investimento Baixo',
  'Sem Resposta':       'Sem resposta',
  'Descartado':         'Sem interesse, especulação',
  'Inválido':           'Duplicado, número errado, teste',
};

const FAIXAS_ORDER = [
  'Não informado',
  'Abaixo de R$70k',
  'R$70k – R$100k',
  'R$70k – R$150k',
  'R$100k – R$200k',
  'R$150k – R$250k',
  'R$200k – R$300k',
  'Acima de R$250k',
];

const ORIGENS_ORDER = ['respondi', 'forms-meta', 'meta', 'ig', 'fb', 'google', 'chatgpt', 'Outros', 'Sem Origem'];
const ORIGEM_LABEL = {
  'respondi': 'Respondi',
  'forms-meta': 'Forms Meta',
  'meta': 'Meta (site)',
  'ig': 'Instagram',
  'fb': 'Facebook',
  'google': 'Google',
  'chatgpt': 'ChatGPT',
  'Outros': 'Outros',
  'Sem Origem': 'Sem origem',
};
const ORIGEM_COLOR = {
  'respondi':   '#037ff0',
  'forms-meta': '#0269c8',
  'meta':       '#014e95',
  'ig':         '#a855f7',
  'fb':         '#4b8ac2',
  'google':     '#e07a00',
  'chatgpt':    '#16a34a',
  'Outros':     '#9aa3ad',
  'Sem Origem': '#ccd2d9',
};
const GRUPOS_ORDER = ['Meta Lead Ads', 'Meta Social', 'Google', 'Orgânico', 'Outros'];

// ============================
// Filter logic
// ============================
function applyFilters(records, filters) {
  const meses = filters.meses && filters.meses.length ? new Set(filters.meses) : null;
  const origens = filters.origens && filters.origens.length ? new Set(filters.origens) : null;
  const categorias = filters.categorias && filters.categorias.length ? new Set(filters.categorias) : null;
  const faixas = filters.faixas && filters.faixas.length ? new Set(filters.faixas) : null;
  const result = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (meses && !meses.has(r.mes)) continue;
    if (origens && !origens.has(r.origem)) continue;
    if (categorias && !categorias.has(r.categoria)) continue;
    if (faixas && !faixas.has(r.faixa)) continue;
    result.push(r);
  }
  return result;
}

// ============================
// Aggregations
// ============================
function countBy(records, key) {
  const out = {};
  for (const r of records) {
    const v = r[key];
    if (v == null) continue;
    out[v] = (out[v] || 0) + 1;
  }
  return out;
}
function groupBy(records, key) {
  const out = {};
  for (const r of records) {
    const v = r[key];
    if (v == null) continue;
    (out[v] = out[v] || []).push(r);
  }
  return out;
}

// Count records considered "válidos" (exclui Duplicado/Número/Teste)
function isValid(r) { return r.categoria !== 'Inválido'; }

// Expose
window.RM = {
  fmtInt, fmtPct, fmtMoney, fmtMoneyFull,
  MONTHS_ORDER, MONTH_LABEL, MONTH_LABEL_FULL,
  CATEGORIAS, CATEGORIA_COLOR, CATEGORIA_DESC,
  FAIXAS_ORDER, ORIGENS_ORDER, ORIGEM_LABEL, ORIGEM_COLOR, GRUPOS_ORDER,
  applyFilters, countBy, groupBy, isValid,
};
