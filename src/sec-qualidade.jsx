/* Seção 3 — Qualidade dos Leads (Funil + Donut + Trend) */

function SecQualidade({ records, meta, filters, setFilters }) {
  const {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
  } = Recharts;

  const totalLeads = records.length;
  const validRecords = records.filter(RM.isValid);
  const totalValid = validRecords.length;

  // Funil
  const inNegotiation = ['Em andamento', 'Reunião'];
  const contatado = ['Convertido','Reunião','Em andamento','Potencial','Baixo Investimento','Sem Resposta','Descartado'];
  const negociacao = ['Em andamento','Reunião','Convertido'];

  const byCat = RM.countBy(validRecords, 'categoria');
  const semStatus = records.filter(r => !r.categoria).length;

  const funnelData = [
    { label: 'Total recebidos', desc: 'Tudo que entrou no CRM', n: totalLeads },
    { label: 'Válidos', desc: 'Excluindo duplicados, número errado, teste', n: totalValid },
    { label: 'Com status real', desc: 'Algum atendimento registrado', n: validRecords.filter(r => r.categoria && r.categoria !== 'Potencial').length + (byCat['Potencial'] || 0) - 0 },
    { label: 'Em negociação', desc: 'Em contato + Reunião + Convertido', n: validRecords.filter(r => negociacao.includes(r.categoria)).length },
    { label: 'Convertidos', desc: 'Fechamento + Assistência', n: byCat['Convertido'] || 0 },
  ];
  // Compute fixed: "Com status real" = validos com categoria ≠ null. Since all valid have categoria here (or Potencial), just use totalValid.
  funnelData[2].n = validRecords.filter(r => r.categoria && !['Potencial'].includes(r.categoria) || true).length - validRecords.filter(r=>!r.categoria).length;
  // Simpler: contatados = válidos com status preenchido. But records with null categoria came from raw status null. Let's keep it as the raw valid count and adjust description.
  funnelData[2] = { label: 'Contatados', desc: 'Lead com algum status no CRM', n: validRecords.filter(r => r.categoria).length };

  const maxFunnel = funnelData[0].n || 1;

  // Donut
  const donutData = RM.CATEGORIAS.filter(c => c !== 'Inválido').map(c => ({
    name: c,
    value: byCat[c] || 0,
    color: RM.CATEGORIA_COLOR[c],
  })).filter(d => d.value > 0);

  // Trend
  const mesesFilter = filters.meses && filters.meses.length ? new Set(filters.meses) : null;
  const trendData = RM.MONTHS_ORDER.map(mes => {
    if (mesesFilter && !mesesFilter.has(mes)) return null;
    const recs = validRecords.filter(r => r.mes === mes);
    const conv = recs.filter(r => r.categoria === 'Convertido').length;
    const reu = recs.filter(r => r.categoria === 'Reunião').length;
    const total = recs.length;
    return {
      mes,
      label: RM.MONTH_LABEL[mes],
      conv: total > 0 ? (conv/total)*100 : 0,
      reu: total > 0 ? (reu/total)*100 : 0,
      semResp: total > 0 ? ((recs.filter(r=>r.categoria==='Sem Resposta').length)/total)*100 : 0,
      total
    };
  }).filter(Boolean);

  const tickStyle = { fill: 'var(--rm-gray-500)', fontSize: 11 };

  return (
    <div>
      <PageHead
        eyebrow="03 · Qualidade"
        title="Funil de qualificação e mix de status"
        lead={`Onde a operação perde leads? Funil mostra a queda etapa por etapa, o donut o mix de qualidade, e a linha o comportamento ao longo dos meses.`}
      />
      <FilterBar filters={filters} setFilters={setFilters} totalCount={window.__DATA.crm.length} filteredCount={records.length} />
      <FilterBarExpanded filters={filters} setFilters={setFilters} />

      <SectionHead title="Funil de qualificação" hint="Top-of-funnel → fechamento" />
      <Card>
        <div className="funnel">
          {funnelData.map((row, i) => {
            const pct = (row.n / maxFunnel) * 100;
            const pctOfPrev = i === 0 ? 100 : (row.n / funnelData[i-1].n) * 100;
            return (
              <div key={row.label} className="funnel__row">
                <div className="funnel__label">
                  {row.label}
                  <span className="sub">{row.desc}</span>
                </div>
                <div className="funnel__bar">
                  <span style={{
                    width: `${Math.max(8, pct)}%`,
                    background: i === funnelData.length-1 ? 'linear-gradient(90deg, #0f7a3a 0%, #16a34a 100%)' :
                                'linear-gradient(90deg, var(--rm-blue) 0%, var(--rm-blue-600) 100%)'
                  }}>
                    {pct > 25 && <>{RM.fmtPct(pctOfPrev, 0)} <span style={{opacity: 0.7, fontWeight: 400, marginLeft: 6}}>vs etapa anterior</span></>}
                    {pct <= 25 && pct > 8 && RM.fmtPct(pctOfPrev, 0)}
                  </span>
                  {pct <= 8 && (
                    <span style={{position: 'absolute', left: `${Math.max(8, pct) + 1}%`, top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--rm-text-xs)', color: 'var(--rm-gray-500)', whiteSpace: 'nowrap'}}>
                      {RM.fmtPct(pctOfPrev, 0)} vs etapa anterior
                    </span>
                  )}
                </div>
                <div className="funnel__num">
                  {RM.fmtInt(row.n)}
                  <span className="pct">{RM.fmtPct((row.n / maxFunnel)*100, 1)} do topo</span>
                </div>
              </div>
            );
          })}
        </div>
        <Insight>
          <b>{RM.fmtInt(totalLeads - totalValid)}</b> leads inválidos são descartados ({RM.fmtPct(((totalLeads-totalValid)/totalLeads)*100, 1)}).
          De válidos para conversão, a queda chega em <span className="blue">{RM.fmtPct((1 - ((byCat['Convertido']||0)/totalValid))*100, 2)}</span>:
          o funil quebra principalmente entre <b>Potencial</b> e <b>Em negociação</b>.
        </Insight>
      </Card>

      <div className="grid grid--2" style={{marginTop: 20}}>
        <Card title="Distribuição por categoria" sub="% sobre leads válidos">
          <div style={{height: 320}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie isAnimationActive={false}
                  data={donutData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  cx="50%"
                  cy="50%"
                >
                  {donutData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [`${RM.fmtInt(v)} (${RM.fmtPct((v/totalValid)*100,1)})`, name]}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Taxa de conversão & sem resposta" sub="Tendência mensal — % sobre válidos do mês">
          <div style={{height: 320}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--rm-gray-200)" vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} axisLine={{stroke: 'var(--rm-gray-300)'}} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => v + '%'} />
                <Tooltip formatter={(v) => RM.fmtPct(v, 2)} />
                <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12 }} iconType="circle" iconSize={8} />
                <Line isAnimationActive={false} type="monotone" dataKey="conv" name="Convertidos" stroke="#0f7a3a" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line isAnimationActive={false} type="monotone" dataKey="reu"  name="Reuniões"    stroke="#16a34a" strokeWidth={2}   dot={{ r: 3 }} />
                <Line isAnimationActive={false} type="monotone" dataKey="semResp" name="Sem resposta" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

    </div>
  );
}

window.SecQualidade = SecQualidade;
