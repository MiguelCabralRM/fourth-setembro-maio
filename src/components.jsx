/* Shared UI components — KpiCard, Card, ChipFilter, FilterBar, Sidebar, PageHead, Insight */

const { useState, useMemo, useCallback, useEffect } = React;

// ============================
// Building blocks
// ============================

function Card({ title, sub, children, dark, soft, className = '', right, style }) {
  const cls = ['card'];
  if (dark) cls.push('card--dark');
  if (soft) cls.push('card--soft');
  if (className) cls.push(className);
  return (
    <div className={cls.join(' ')} style={style}>
      {(title || sub || right) && (
        <div className="card__head">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {sub && <div className="card__sub">{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Kpi({ label, value, unit, sub, hint, pill, dark }) {
  return (
    <Card dark={dark}>
      <div className="kpi">
        <div className="kpi__label">{label}</div>
        <div className="kpi__value">
          {value}
          {unit && <span className="unit">{unit}</span>}
        </div>
        {sub && <div className="kpi__sub" dangerouslySetInnerHTML={{__html: sub}} />}
        {pill && <span className={`kpi__pill kpi__pill--${pill.tone}`}>{pill.label}</span>}
      </div>
    </Card>
  );
}

function Insight({ children }) {
  return (
    <div className="insight">
      <div className="insight__icon">→</div>
      <div className="insight__body">{children}</div>
    </div>
  );
}

function SectionHead({ title, hint }) {
  return (
    <div className="section-head">
      <h3 className="section-head__title">{title}</h3>
      {hint && <span className="section-head__hint">{hint}</span>}
    </div>
  );
}

// ============================
// Chips & Filter bar
// ============================
function Chip({ active, onClick, children, dim }) {
  const cls = ['chip'];
  if (active) cls.push('active');
  if (dim) cls.push('dim');
  return <button type="button" className={cls.join(' ')} onClick={onClick}>{children}</button>;
}

function ChipGroup({ label, options, getLabel = (x) => x, selected, onToggle, dim }) {
  return (
    <div className="filterbar__group">
      <span className="filterbar__label">{label}</span>
      {options.map(opt => (
        <Chip
          key={opt}
          active={selected.includes(opt)}
          onClick={() => onToggle(opt)}
          dim={dim}
        >
          {getLabel(opt)}
        </Chip>
      ))}
    </div>
  );
}

function FilterBar({ filters, setFilters, totalCount, filteredCount }) {
  const toggle = (key, val) => {
    setFilters(prev => {
      const cur = prev[key] || [];
      const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
      return { ...prev, [key]: next };
    });
  };
  const reset = () => setFilters({ meses: [], origens: [], categorias: [], faixas: [] });
  const hasFilters = (filters.meses.length || filters.origens.length || filters.categorias.length || filters.faixas.length) > 0;
  return (
    <div className="filterbar">
      <ChipGroup
        label="Mês"
        options={RM.MONTHS_ORDER}
        getLabel={(m) => RM.MONTH_LABEL[m]}
        selected={filters.meses}
        onToggle={(v) => toggle('meses', v)}
      />
      <div className="filterbar__sep" />
      <ChipGroup
        label="Categoria"
        options={RM.CATEGORIAS}
        selected={filters.categorias}
        onToggle={(v) => toggle('categorias', v)}
        dim
      />
      <div className="filterbar__foot">
        <div className="filterbar__count">
          <b>{RM.fmtInt(filteredCount)}</b> de {RM.fmtInt(totalCount)} leads
          {hasFilters && <span style={{marginLeft: 8, color: 'var(--rm-blue)'}}>· filtros ativos</span>}
        </div>
        {hasFilters && (
          <button className="filterbar__reset" onClick={reset}>Limpar filtros</button>
        )}
      </div>
    </div>
  );
}

function FilterBarExpanded({ filters, setFilters }) {
  const toggle = (key, val) => {
    setFilters(prev => {
      const cur = prev[key] || [];
      const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
      return { ...prev, [key]: next };
    });
  };
  return (
    <div className="filterbar">
      <ChipGroup
        label="Origem"
        options={RM.ORIGENS_ORDER.filter(o => ['respondi','forms-meta','meta','ig','fb','google','chatgpt'].includes(o))}
        getLabel={(o) => RM.ORIGEM_LABEL[o]}
        selected={filters.origens}
        onToggle={(v) => toggle('origens', v)}
        dim
      />
      <div className="filterbar__sep" />
      <ChipGroup
        label="Investimento"
        options={RM.FAIXAS_ORDER}
        selected={filters.faixas}
        onToggle={(v) => toggle('faixas', v)}
        dim
      />
    </div>
  );
}

// ============================
// Sidebar
// ============================
const NAV_ITEMS = [
  { id: 'visao-geral',   label: 'Visão geral',         num: '01' },
  { id: 'evolucao',      label: 'Evolução mensal',     num: '02' },
  { id: 'qualidade',     label: 'Qualidade dos leads', num: '03' },
  { id: 'origem',        label: 'Análise por origem',  num: '04' },
  { id: 'investimento',  label: 'Investimento × Resultado', num: '05' },
  { id: 'anuncios',      label: 'Análise dos anúncios', num: '06' },
];

function Sidebar({ current, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__glow" />
      <div className="sidebar__brand">
        <img src="assets/Logo.svg" alt="RM Digital" className="sidebar__logo" />
        <div className="sidebar__title">Fourth <span className="blue">·</span> Dashboard</div>
        <div className="sidebar__subtitle">SET/25 — MAI/26 · CRM + META ADS</div>
      </div>
      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Seções de análise</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={'sidebar__link' + (current === item.id ? ' active' : '')}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar__num">{item.num}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar__foot">
        <strong>RM Digital</strong><br />
        Relatório operacional · 9 meses<br />
        <span style={{opacity: 0.6}}>7.884 leads · R$ 150.085 investidos</span>
      </div>
    </aside>
  );
}

function PageHead({ eyebrow, title, lead }) {
  return (
    <div className="page-head">
      <div className="page-head__left">
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {lead && <p className="page-lead" dangerouslySetInnerHTML={{__html: lead}} />}
      </div>
    </div>
  );
}

// Expose
Object.assign(window, {
  Card, Kpi, Insight, SectionHead, Chip, ChipGroup,
  FilterBar, FilterBarExpanded, Sidebar, PageHead, NAV_ITEMS,
});
