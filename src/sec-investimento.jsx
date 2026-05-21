/* Seção 5 — Investimento × Resultado */

function SecInvestimento({ records, meta, filters, setFilters }) {
  const {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
  } = Recharts;

  const valid = records.filter(RM.isValid);
  const tickStyle = { fill: 'var(--rm-gray-500)', fontSize: 11 };

  // 5A — Distribuição por faixa (stacked: por categoria)
  const faixaRows = RM.FAIXAS_ORDER.map(faixa => {
    const recs = valid.filter(r => r.faixa === faixa);
    const total = recs.length;
    const cats = RM.countBy(recs, 'categoria');
    return {
      faixa,
      total,
      Convertido: cats['Convertido'] || 0,
      Reunião: cats['Reunião'] || 0,
      'Em andamento': cats['Em andamento'] || 0,
      Potencial: cats['Potencial'] || 0,
      'Baixo Investimento': cats['Baixo Investimento'] || 0,
      'Sem Resposta': cats['Sem Resposta'] || 0,
      Descartado: cats['Descartado'] || 0,
      pctConv: total > 0 ? ((cats['Convertido']||0) / total) * 100 : 0,
      pctQualif: total > 0 ? (((cats['Convertido']||0)+(cats['Reunião']||0)+(cats['Em andamento']||0)) / total) * 100 : 0,
    };
  }).filter(r => r.total > 0);

  const STACK_CATS = ['Convertido','Reunião','Em andamento','Potencial','Baixo Investimento','Sem Resposta','Descartado'];

  // 5B — Heatmap: origem (linhas) × faixa (colunas)
  const heatOrigens = ['respondi','forms-meta','meta','ig','fb','google'];
  const heatFaixas = RM.FAIXAS_ORDER.filter(f => f !== 'Não informado');
  const heatMatrix = heatOrigens.map(o => ({
    origem: o,
    cells: heatFaixas.map(f => {
      const recs = valid.filter(r => r.origem === o && r.faixa === f);
      return { faixa: f, count: recs.length, total: recs.length };
    })
  }));
  const maxHeat = Math.max(...heatMatrix.flatMap(r => r.cells.map(c => c.count)), 1);

  // 5C — ROI Meta por mês
  const mesesFilter = filters.meses && filters.meses.length ? new Set(filters.meses) : null;
  const roiRows = RM.MONTHS_ORDER
    .filter(m => !mesesFilter || mesesFilter.has(m))
    .map(mes => {
      const metaThis = meta.filter(m => m.mes === mes);
      const inv = metaThis.reduce((s,x)=>s+x.investimento, 0);
      const metaLeads = metaThis.reduce((s,x)=>s+x.leads, 0);
      // Leads via Meta (CRM): respondi + forms-meta + meta + ig + fb
      const crmMetaLeads = valid.filter(r => r.mes === mes && ['respondi','forms-meta','meta','ig','fb'].includes(r.origem)).length;
      const convertidos = valid.filter(r => r.mes === mes && r.categoria === 'Convertido' && ['respondi','forms-meta','meta','ig','fb'].includes(r.origem)).length;
      const reunioes = valid.filter(r => r.mes === mes && r.categoria === 'Reunião' && ['respondi','forms-meta','meta','ig','fb'].includes(r.origem)).length;
      return {
        mes,
        label: RM.MONTH_LABEL_FULL[mes],
        inv,
        metaLeads,
        crmMetaLeads,
        convertidos,
        reunioes,
        cpl: metaLeads > 0 ? inv / metaLeads : 0,
        cplCrm: crmMetaLeads > 0 ? inv / crmMetaLeads : 0,
        cpReu: reunioes > 0 ? inv / reunioes : 0,
        cpConv: convertidos > 0 ? inv / convertidos : 0,
      };
    });

  const heatColor = (n) => {
    if (n === 0) return '#f5f5f5';
    const intensity = Math.min(1, n / maxHeat);
    // interpolate paper -> blue
    const r = Math.round(230 + (3 - 230) * intensity);
    const g = Math.round(233 + (127 - 233) * intensity);
    const b = Math.round(236 + (240 - 236) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };
  const heatTextColor = (n) => {
    const intensity = Math.min(1, n / maxHeat);
    return intensity > 0.55 ? '#fff' : 'var(--rm-ink)';
  };

  // Stats: qual faixa tem mais conversão?
  const bestFaixa = faixaRows.filter(r => r.total >= 100 && r.faixa !== 'Não informado').slice().sort((a,b) => b.pctQualif - a.pctQualif)[0];
  const baixaFaixa = faixaRows.find(r => r.faixa === 'Abaixo de R$70k');

  return (
    <div>
      <PageHead
        eyebrow="05 · Investimento × Resultado"
        title="O dinheiro fica na faixa certa?"
        lead={`Cruzamos a <b>faixa de capital declarada</b> do lead com o resultado do CRM e com o gasto Meta. Resposta a duas perguntas: <b>quanto custa cada coisa</b> e <b>onde está o lead bom</b>.`}
      />
      <FilterBar filters={filters} setFilters={setFilters} totalCount={window.__DATA.crm.length} filteredCount={records.length} />
      <FilterBarExpanded filters={filters} setFilters={setFilters} />

      <SectionHead title="Distribuição por faixa de capital" hint="Empilhado por categoria · clique nos chips acima para filtrar" />
      <Card>
        <div style={{height: 340}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={faixaRows} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--rm-gray-200)" vertical={false} />
              <XAxis dataKey="faixa" tick={tickStyle} axisLine={{stroke: 'var(--rm-gray-300)'}} tickLine={false} interval={0} angle={-12} textAnchor="end" height={70} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => RM.fmtInt(v)} cursor={{ fill: 'rgba(3,127,240,0.05)' }} />
              <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12 }} iconType="circle" iconSize={8} />
              {STACK_CATS.map(cat => (
                <Bar isAnimationActive={false} key={cat} dataKey={cat} stackId="a" fill={RM.CATEGORIA_COLOR[cat]} radius={cat === 'Descartado' ? [4,4,0,0] : 0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {bestFaixa && baixaFaixa && (
          <Insight>
            Faixa com maior taxa de qualificação (Conv + Reu + Em andamento): <span className="blue">{bestFaixa.faixa}</span> ({RM.fmtPct(bestFaixa.pctQualif, 1)}).
            Os <b>{RM.fmtInt(baixaFaixa.total)}</b> leads em <b>Abaixo de R$70k</b> representam {RM.fmtPct((baixaFaixa.total/valid.length)*100, 1)} do total —
            grande parte cai em <b>Investimento Baixo</b> ou <b>Descartado</b>.
          </Insight>
        )}
      </Card>

      <SectionHead title="Origem × Faixa de capital" hint="Heatmap — quem traz lead grande?" />
      <Card>
        <div style={{overflowX: 'auto'}}>
          <div className="heatmap" style={{gridTemplateColumns: `160px repeat(${heatFaixas.length}, minmax(110px, 1fr))`}}>
            <div className="heatmap__cell heatmap__cell--head"></div>
            {heatFaixas.map(f => (
              <div key={f} className="heatmap__cell heatmap__cell--head" style={{textAlign:'center', padding: '8px 4px'}}>{f}</div>
            ))}
            {heatMatrix.map(row => (
              <React.Fragment key={row.origem}>
                <div className="heatmap__cell heatmap__cell--rowhead">
                  <span className="dot" style={{background: RM.ORIGEM_COLOR[row.origem]}} />
                  {RM.ORIGEM_LABEL[row.origem]}
                </div>
                {row.cells.map(cell => (
                  <div
                    key={cell.faixa}
                    className="heatmap__cell"
                    style={{ background: heatColor(cell.count), color: heatTextColor(cell.count) }}
                  >
                    {cell.count > 0 ? RM.fmtInt(cell.count) : '—'}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        <Insight>
          Leads de <b>capital alto</b> (Acima de R$250k) vêm proporcionalmente mais via <b>Instagram</b> e <b>meta direto</b> do que via Respondi/Forms.
          Isso sugere que <span className="blue">criativos sociais qualificam melhor</span> que o fluxo de captura por formulário.
        </Insight>
      </Card>

      <SectionHead title="ROI do Meta Ads por mês" hint="Custo por lead, reunião e fechamento" />
      <div className="tbl__wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Mês</th>
              <th className="num" style={{textAlign:'right'}}>Investimento</th>
              <th className="num" style={{textAlign:'right'}}>Leads (Meta)</th>
              <th className="num" style={{textAlign:'right'}}>Leads (CRM)</th>
              <th className="num" style={{textAlign:'right'}}>Reuniões</th>
              <th className="num" style={{textAlign:'right'}}>Conv.</th>
              <th className="num" style={{textAlign:'right'}}>CPL</th>
              <th className="num" style={{textAlign:'right'}}>Custo/Reunião</th>
              <th className="num" style={{textAlign:'right'}}>Custo/Fechamento</th>
            </tr>
          </thead>
          <tbody>
            {roiRows.map(r => (
              <tr key={r.mes}>
                <td><b>{r.label}</b></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtMoney(r.inv)}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(r.metaLeads)}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(r.crmMetaLeads)}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(r.reunioes)}</td>
                <td className="num" style={{textAlign:'right'}}><span className="blue">{RM.fmtInt(r.convertidos)}</span></td>
                <td className="num" style={{textAlign:'right'}}>{r.cpl > 0 ? RM.fmtMoneyFull(r.cpl) : '—'}</td>
                <td className="num" style={{textAlign:'right'}}>{r.cpReu > 0 ? RM.fmtMoneyFull(r.cpReu) : '—'}</td>
                <td className="num" style={{textAlign:'right'}}>{r.cpConv > 0 ? <b>{RM.fmtMoneyFull(r.cpConv)}</b> : '—'}</td>
              </tr>
            ))}
            <tr style={{background: 'var(--rm-blue-50)'}}>
              <td><b>Total / média</b></td>
              <td className="num" style={{textAlign:'right'}}><b>{RM.fmtMoney(roiRows.reduce((s,r)=>s+r.inv,0))}</b></td>
              <td className="num" style={{textAlign:'right'}}><b>{RM.fmtInt(roiRows.reduce((s,r)=>s+r.metaLeads,0))}</b></td>
              <td className="num" style={{textAlign:'right'}}><b>{RM.fmtInt(roiRows.reduce((s,r)=>s+r.crmMetaLeads,0))}</b></td>
              <td className="num" style={{textAlign:'right'}}><b>{RM.fmtInt(roiRows.reduce((s,r)=>s+r.reunioes,0))}</b></td>
              <td className="num" style={{textAlign:'right'}}><b>{RM.fmtInt(roiRows.reduce((s,r)=>s+r.convertidos,0))}</b></td>
              <td className="num" style={{textAlign:'right'}}>
                {(() => {
                  const inv = roiRows.reduce((s,r)=>s+r.inv,0);
                  const lds = roiRows.reduce((s,r)=>s+r.metaLeads,0);
                  return lds > 0 ? <b>{RM.fmtMoneyFull(inv/lds)}</b> : '—';
                })()}
              </td>
              <td className="num" style={{textAlign:'right'}}>
                {(() => {
                  const inv = roiRows.reduce((s,r)=>s+r.inv,0);
                  const reu = roiRows.reduce((s,r)=>s+r.reunioes,0);
                  return reu > 0 ? <b>{RM.fmtMoneyFull(inv/reu)}</b> : '—';
                })()}
              </td>
              <td className="num" style={{textAlign:'right'}}>
                {(() => {
                  const inv = roiRows.reduce((s,r)=>s+r.inv,0);
                  const conv = roiRows.reduce((s,r)=>s+r.convertidos,0);
                  return conv > 0 ? <b>{RM.fmtMoneyFull(inv/conv)}</b> : '—';
                })()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

window.SecInvestimento = SecInvestimento;
