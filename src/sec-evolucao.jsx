/* Seção 2 — Evolução Mensal */

function SecEvolucao({ records, meta, filters, setFilters }) {
  const {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line, ComposedChart, CartesianAxis, Cell
  } = Recharts;

  // Filter Meta by month filter only
  const mesesFilter = filters.meses && filters.meses.length ? new Set(filters.meses) : null;
  const metaFiltered = mesesFilter ? meta.filter(m => mesesFilter.has(m.mes)) : meta;

  // Build monthly aggregates
  const monthlyAgg = useMemo(() => {
    const valid = records.filter(RM.isValid);
    const byMes = RM.groupBy(valid, 'mes');
    const rows = RM.MONTHS_ORDER.map(mes => {
      if (mesesFilter && !mesesFilter.has(mes)) return null;
      const recs = byMes[mes] || [];
      const cats = RM.countBy(recs, 'categoria');
      const totMeses = recs.length;
      // Meta totals for this month
      const metaThis = meta.filter(m => m.mes === mes);
      const metaInv = metaThis.reduce((s,x)=>s+x.investimento, 0);
      const metaLeads = metaThis.reduce((s,x)=>s+x.leads, 0);
      const cpl = metaLeads > 0 ? metaInv / metaLeads : 0;
      const convertidos = cats['Convertido'] || 0;
      const taxaConv = totMeses > 0 ? (convertidos / totMeses) * 100 : 0;
      return {
        mes,
        label: RM.MONTH_LABEL[mes],
        total: totMeses,
        Convertido: cats['Convertido'] || 0,
        Reunião: cats['Reunião'] || 0,
        'Em andamento': cats['Em andamento'] || 0,
        Potencial: cats['Potencial'] || 0,
        'Baixo Investimento': cats['Baixo Investimento'] || 0,
        'Sem Resposta': cats['Sem Resposta'] || 0,
        Descartado: cats['Descartado'] || 0,
        metaInv,
        metaLeads,
        cpl,
        taxaConv,
      };
    }).filter(Boolean);
    return rows;
  }, [records, meta, filters.meses]);

  const tickStyle = { fill: 'var(--rm-gray-500)', fontSize: 11 };

  const STACK_CATS = ['Convertido','Reunião','Em andamento','Potencial','Baixo Investimento','Sem Resposta','Descartado'];

  return (
    <div>
      <PageHead
        eyebrow="02 · Evolução"
        title="Volume, qualidade e custo mês a mês"
        lead={`Setembro/25 → Maio/26. Use os chips para isolar meses; o gráfico empilhado mostra o mix de qualidade por mês, e o segundo painel cruza <b class="blue">CPL</b> com investimento.`}
      />
      <FilterBar filters={filters} setFilters={setFilters} totalCount={window.__DATA.crm.length} filteredCount={records.length} />
      <FilterBarExpanded filters={filters} setFilters={setFilters} />

      <SectionHead title="Volume mensal por categoria de qualidade" hint="Barras empilhadas · leads válidos" />
      <Card>
        <div style={{height: 380}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyAgg} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--rm-gray-200)" vertical={false} />
              <XAxis dataKey="label" tick={tickStyle} axisLine={{stroke: 'var(--rm-gray-300)'}} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => RM.fmtInt(v)}
                cursor={{ fill: 'rgba(3,127,240,0.05)' }}
              />
              <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12 }} iconType="circle" iconSize={8} />
              {STACK_CATS.map(cat => (
                <Bar isAnimationActive={false} key={cat} dataKey={cat} stackId="a" fill={RM.CATEGORIA_COLOR[cat]} radius={cat === 'Descartado' ? [4,4,0,0] : 0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid--2" style={{marginTop: 20}}>
        <Card title="Investimento Meta × CPL" sub="Linha = custo por lead (R$). Barras = R$ investido.">
          <div style={{height: 320}}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyAgg} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--rm-gray-200)" vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} axisLine={{stroke: 'var(--rm-gray-300)'}} tickLine={false} />
                <YAxis yAxisId="l" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => 'R$' + (v/1000).toFixed(0) + 'k'} />
                <YAxis yAxisId="r" orientation="right" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => 'R$' + Math.round(v)} />
                <Tooltip
                  formatter={(v, name) => {
                    if (name === 'CPL') return [RM.fmtMoneyFull(v), name];
                    if (name === 'Investimento') return [RM.fmtMoney(v), name];
                    return [RM.fmtInt(v), name];
                  }}
                  cursor={{ fill: 'rgba(3,127,240,0.05)' }}
                />
                <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12 }} iconType="circle" iconSize={8} />
                <Bar isAnimationActive={false} yAxisId="l" dataKey="metaInv" name="Investimento" fill="var(--rm-blue-200)" radius={[4,4,0,0]} />
                <Line isAnimationActive={false} yAxisId="r" type="monotone" dataKey="cpl" name="CPL" stroke="var(--rm-blue)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--rm-blue)' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Taxa de conversão" sub="% Convertidos sobre leads válidos do mês.">
          <div style={{height: 320}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyAgg} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--rm-gray-200)" vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} axisLine={{stroke: 'var(--rm-gray-300)'}} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => v + '%'} />
                <Tooltip
                  formatter={(v) => [RM.fmtPct(v, 2), 'Taxa']}
                  cursor={{ stroke: 'var(--rm-gray-300)' }}
                />
                <Line isAnimationActive={false} type="monotone" dataKey="taxaConv" name="Taxa de conversão" stroke="#0f7a3a" strokeWidth={2.5} dot={{ r: 5, fill: '#0f7a3a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <SectionHead title="Resumo mensal" hint="Números brutos por mês" />
      <div className="tbl__wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Mês</th>
              <th className="num" style={{textAlign:'right'}}>Leads válidos</th>
              <th className="num" style={{textAlign:'right'}}>Convertidos</th>
              <th className="num" style={{textAlign:'right'}}>Reuniões</th>
              <th className="num" style={{textAlign:'right'}}>Sem resposta</th>
              <th className="num" style={{textAlign:'right'}}>Inv. Meta</th>
              <th className="num" style={{textAlign:'right'}}>CPL</th>
              <th className="num" style={{textAlign:'right'}}>% Conv</th>
            </tr>
          </thead>
          <tbody>
            {monthlyAgg.map(row => (
              <tr key={row.mes}>
                <td><b>{RM.MONTH_LABEL_FULL[row.mes]}</b></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(row.total)}</td>
                <td className="num" style={{textAlign:'right'}}><span className="blue">{RM.fmtInt(row.Convertido)}</span></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(row.Reunião)}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(row['Sem Resposta'])}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtMoney(row.metaInv)}</td>
                <td className="num" style={{textAlign:'right'}}>{row.cpl > 0 ? RM.fmtMoneyFull(row.cpl) : '—'}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtPct(row.taxaConv, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.SecEvolucao = SecEvolucao;
