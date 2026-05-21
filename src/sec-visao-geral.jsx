/* Seção 1 — Visão Geral (KPIs + visão executiva) */

function SecVisaoGeral({ records, meta, filters, setFilters }) {
  // Compute KPIs from filtered records
  const totalLeads = records.length;
  const validRecords = records.filter(RM.isValid);
  const totalValid = validRecords.length;

  const byCat = RM.countBy(validRecords, 'categoria');
  const convertidos = byCat['Convertido'] || 0;
  const reunioes = byCat['Reunião'] || 0;
  const semResposta = byCat['Sem Resposta'] || 0;
  const baixoInv = byCat['Baixo Investimento'] || 0;

  // Meta totals — filtered by month
  const mesesFilter = filters.meses && filters.meses.length ? new Set(filters.meses) : null;
  const metaFiltered = mesesFilter ? meta.filter(m => mesesFilter.has(m.mes)) : meta;
  const totalMeta = metaFiltered.reduce((s, m) => s + (m.investimento || 0), 0);
  const totalMetaLeads = metaFiltered.reduce((s, m) => s + (m.leads || 0), 0);
  // CPL = meta cost / meta leads
  const cplMeta = totalMetaLeads > 0 ? totalMeta / totalMetaLeads : 0;
  // Custo por fechamento: total Meta / convertidos (assumindo conversões vieram do Meta)
  const custoConv = convertidos > 0 ? totalMeta / convertidos : 0;
  // Custo por reunião
  const custoReu = reunioes > 0 ? totalMeta / reunioes : 0;

  // CRM total leads from Meta sources (for comparison with Meta-reported count)
  const metaCrmLeads = records.filter(r => ['respondi','forms-meta','meta','ig','fb'].includes(r.origem)).length;

  // Período
  const mesesAtivos = filters.meses && filters.meses.length ? filters.meses.length : 9;

  const taxaConv = totalValid > 0 ? (convertidos / totalValid) * 100 : 0;
  const taxaReu = totalValid > 0 ? (reunioes / totalValid) * 100 : 0;
  const taxaSemResp = totalValid > 0 ? (semResposta / totalValid) * 100 : 0;
  const taxaBaixoInv = totalValid > 0 ? (baixoInv / totalValid) * 100 : 0;

  return (
    <div>
      <PageHead
        eyebrow="01 · Visão Geral"
        title="Os números da operação"
        lead={`Operação de captação no Meta Ads, com leads chegando via <b>Respondi</b>, <b>formulário nativo</b> e <b>Instagram/Facebook</b>. <b class="blue">${mesesAtivos} ${mesesAtivos===1?'mês':'meses'}</b> · <b class="blue">${RM.fmtInt(totalLeads)}</b> leads · <b class="blue">${RM.fmtMoney(totalMeta)}</b> investidos.`}
      />

      <FilterBar filters={filters} setFilters={setFilters} totalCount={window.__DATA.crm.length} filteredCount={totalLeads} />
      <FilterBarExpanded filters={filters} setFilters={setFilters} />

      {/* Hero KPIs — Leads + Convertidos */}
      <div className="grid grid--kpi-4" style={{marginTop: 24}}>
        <Kpi
          dark
          label="Total de Leads"
          value={RM.fmtInt(totalLeads)}
          sub={`<b>${RM.fmtInt(totalValid)}</b> válidos (excluindo duplicados e testes)`}
        />
        <Kpi
          label="Convertidos"
          value={RM.fmtInt(convertidos)}
          sub={`<span class="blue">${RM.fmtPct(taxaConv, 2)}</span> dos válidos · Fechamento + Assistência`}
        />
        <Kpi
          label="Reuniões"
          value={RM.fmtInt(reunioes)}
          sub={`<span class="blue">${RM.fmtPct(taxaReu, 1)}</span> dos válidos`}
        />
        <Kpi
          label="Investimento Meta"
          value={RM.fmtMoney(totalMeta, { short: true })}
          sub={`<b>${RM.fmtInt(metaFiltered.reduce((s,m)=>s+m.impressoes,0))}</b> impressões · <b>${RM.fmtInt(metaFiltered.reduce((s,m)=>s+m.cliques,0))}</b> cliques`}
        />
      </div>

      {/* Sub KPIs — Custos e taxas */}
      <SectionHead title="Custos & qualidade" hint="Por lead, por reunião, por fechamento" />
      <div className="grid grid--kpi-4">
        <Kpi
          label="CPL médio (Meta)"
          value={RM.fmtMoneyFull(cplMeta)}
          sub={`Custo total Meta / <b>${RM.fmtInt(totalMetaLeads)}</b> leads reportados`}
        />
        <Kpi
          label="Custo por reunião"
          value={reunioes > 0 ? RM.fmtMoneyFull(custoReu) : '—'}
          sub={reunioes > 0 ? `Considerando todo o investimento Meta no período` : 'Sem reuniões no filtro atual'}
        />
        <Kpi
          label="Custo por fechamento"
          value={convertidos > 0 ? RM.fmtMoneyFull(custoConv) : '—'}
          sub={convertidos > 0 ? `Total Meta / <b>${convertidos}</b> fechamentos` : 'Sem fechamentos no filtro atual'}
        />
        <Kpi
          label="Taxa de Sem Resposta"
          value={RM.fmtPct(taxaSemResp, 1)}
          sub={`<b>${RM.fmtInt(semResposta)}</b> leads sem resposta · ${RM.fmtPct(taxaBaixoInv, 1)} com inv. baixo`}
        />
      </div>

      {/* Distribuição rápida por categoria */}
      <SectionHead title="Mix de qualidade" hint="Distribuição das categorias sobre o total válido" />
      <Card>
        <div style={{display:'flex', flexDirection:'column', gap: 14}}>
          {RM.CATEGORIAS.filter(c => c !== 'Inválido').map(cat => {
            const n = byCat[cat] || 0;
            const pct = totalValid > 0 ? (n / totalValid) * 100 : 0;
            // Scale bar width relative to largest category in mix
            const maxPct = Math.max(...RM.CATEGORIAS.filter(c => c !== 'Inválido').map(c => totalValid > 0 ? (byCat[c]||0)/totalValid*100 : 0), 1);
            return (
              <div key={cat} style={{display:'grid', gridTemplateColumns:'220px 1fr 80px 80px', gap: 16, alignItems:'center'}}>
                <div>
                  <span className="dot" style={{background: RM.CATEGORIA_COLOR[cat]}} />
                  <span style={{fontWeight: 600, color: 'var(--rm-ink)', fontSize: 14}}>{cat}</span>
                  <div style={{fontSize: 11, color: 'var(--rm-gray-500)', marginLeft: 16, marginTop: 2}}>
                    {RM.CATEGORIA_DESC[cat]}
                  </div>
                </div>
                <div className="bar" style={{height: 10}}>
                  <span style={{
                    width: `${(pct / maxPct) * 100}%`,
                    background: RM.CATEGORIA_COLOR[cat]
                  }} />
                </div>
                <div style={{textAlign:'right', fontWeight: 700, color: 'var(--rm-ink)', fontVariantNumeric: 'tabular-nums', fontSize: 14}}>
                  {RM.fmtInt(n)}
                </div>
                <div style={{textAlign:'right', color: 'var(--rm-gray-500)', fontVariantNumeric: 'tabular-nums', fontSize: 13}}>
                  {RM.fmtPct(pct, 1)}
                </div>
              </div>
            );
          })}
        </div>
        <Insight>
          A operação ainda é dominada por <b>Potencial</b> ({RM.fmtPct(((byCat['Potencial']||0)/totalValid)*100, 1)}) — leads em fila de tentativa.
          Para subir conversão real é preciso destravar esse pool: <span className="blue">o gargalo é resposta, não volume</span>.
        </Insight>
      </Card>

    </div>
  );
}

window.SecVisaoGeral = SecVisaoGeral;
