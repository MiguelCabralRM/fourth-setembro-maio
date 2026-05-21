/* Seção 4 — Análise por Origem */

function SecOrigem({ records, meta, filters, setFilters }) {
  const {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
  } = Recharts;

  const valid = records.filter(RM.isValid);
  const tickStyle = { fill: 'var(--rm-gray-500)', fontSize: 11 };

  // Per origem (sub-source)
  const origensList = ['respondi','forms-meta','meta','ig','fb','google','chatgpt','Outros','Sem Origem'];

  function statsFor(predicate) {
    const recs = valid.filter(predicate);
    const total = recs.length;
    const cats = RM.countBy(recs, 'categoria');
    const convertidos = cats['Convertido'] || 0;
    const reunioes = cats['Reunião'] || 0;
    const semResp = cats['Sem Resposta'] || 0;
    const baixoInv = cats['Baixo Investimento'] || 0;
    const desc = cats['Descartado'] || 0;
    return {
      total,
      convertidos, reunioes, semResp, baixoInv, desc,
      pctConv: total>0 ? (convertidos/total)*100 : 0,
      pctReu:  total>0 ? (reunioes/total)*100 : 0,
      pctSem:  total>0 ? (semResp/total)*100 : 0,
      pctInv:  total>0 ? (baixoInv/total)*100 : 0,
      // Quality score: weighted (conv*3 + reu*1) - (semResp*0.5 + baixoInv*0.2) per 100
      score: total>0 ? ((convertidos*5 + reunioes*1.5 - semResp*0.3 - baixoInv*0.2) / total) * 100 : 0,
    };
  }

  const origemRows = origensList
    .map(o => ({ origem: o, ...statsFor(r => r.origem === o) }))
    .filter(r => r.total > 0)
    .sort((a,b) => b.total - a.total);

  // Group stats (Meta Lead Ads vs Meta Social vs Google vs Orgânico vs Outros)
  const grupoRows = RM.GRUPOS_ORDER
    .map(g => ({ grupo: g, ...statsFor(r => r.grupo === g) }))
    .filter(r => r.total > 0);

  // Chart data: comparison bars
  const chartData = origemRows.map(r => ({
    name: RM.ORIGEM_LABEL[r.origem],
    'Convertido %': Number(r.pctConv.toFixed(2)),
    'Reunião %': Number(r.pctReu.toFixed(2)),
    'Sem Resposta %': Number(r.pctSem.toFixed(2)),
    'Inv. Baixo %': Number(r.pctInv.toFixed(2)),
    total: r.total,
  }));

  const maxTotal = Math.max(...origemRows.map(r => r.total), 1);

  // Best/worst
  const top = origemRows.filter(r => r.total >= 50).slice().sort((a,b) => b.pctConv + b.pctReu - (a.pctConv + a.pctReu))[0];
  const worst = origemRows.filter(r => r.total >= 50).slice().sort((a,b) => b.pctSem - a.pctSem)[0];

  return (
    <div>
      <PageHead
        eyebrow="04 · Origem"
        title="Onde o lead bom vem de"
        lead={`Comparamos as origens do CRM. <b>Respondi</b>, <b>forms-meta</b> e <b>meta</b> são todos pagos via <b class="blue">rm_leadads</b>; <b>Instagram</b> e <b>Facebook</b> podem ser pago ou orgânico; <b>Google</b> é Google Ads; <b>ChatGPT</b> é orgânico.`}
      />
      <FilterBar filters={filters} setFilters={setFilters} totalCount={window.__DATA.crm.length} filteredCount={records.length} />
      <FilterBarExpanded filters={filters} setFilters={setFilters} />

      <SectionHead title="Volume e qualidade por origem" hint="Leads válidos" />
      <div className="tbl__wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Origem</th>
              <th className="num" style={{textAlign:'right'}}>Total</th>
              <th>Volume</th>
              <th className="num" style={{textAlign:'right'}}>% Convertidos</th>
              <th className="num" style={{textAlign:'right'}}>% Reuniões</th>
              <th className="num" style={{textAlign:'right'}}>% Sem resposta</th>
              <th className="num" style={{textAlign:'right'}}>% Inv. baixo</th>
              <th className="num" style={{textAlign:'right'}}>Quality Score</th>
            </tr>
          </thead>
          <tbody>
            {origemRows.map(r => (
              <tr key={r.origem}>
                <td>
                  <span className="dot" style={{background: RM.ORIGEM_COLOR[r.origem]}} />
                  <b>{RM.ORIGEM_LABEL[r.origem]}</b>
                </td>
                <td className="num" style={{textAlign:'right'}}><b>{RM.fmtInt(r.total)}</b></td>
                <td><div className="bar"><span style={{width: `${(r.total/maxTotal)*100}%`, background: RM.ORIGEM_COLOR[r.origem]}}/></div></td>
                <td className="num" style={{textAlign:'right'}}><span className="blue">{RM.fmtPct(r.pctConv, 2)}</span></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtPct(r.pctReu, 2)}</td>
                <td className="num" style={{textAlign:'right', color: r.pctSem > 10 ? '#dc2626' : undefined}}>{RM.fmtPct(r.pctSem, 1)}</td>
                <td className="num" style={{textAlign:'right', color: r.pctInv > 15 ? '#e07a00' : undefined}}>{RM.fmtPct(r.pctInv, 1)}</td>
                <td className="num" style={{textAlign:'right'}}>
                  <b style={{ color: r.score > 5 ? '#0f7a3a' : r.score < 0 ? '#dc2626' : 'var(--rm-ink)' }}>
                    {r.score.toFixed(1)}
                  </b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid--2" style={{marginTop: 20}}>
        <Card title="Comparação visual" sub="% de leads em cada categoria, por origem">
          <div style={{height: 380}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 16, left: 60, bottom: 0 }}
                barCategoryGap={10}
              >
                <CartesianGrid stroke="var(--rm-gray-200)" horizontal={false} />
                <XAxis type="number" tick={tickStyle} axisLine={{stroke:'var(--rm-gray-300)'}} tickLine={false} tickFormatter={(v) => v+'%'} />
                <YAxis dataKey="name" type="category" tick={tickStyle} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v, name) => [RM.fmtPct(v, 2), name]} />
                <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12 }} iconType="circle" iconSize={8} />
                <Bar isAnimationActive={false} dataKey="Convertido %" fill="#0f7a3a" />
                <Bar isAnimationActive={false} dataKey="Reunião %" fill="#16a34a" />
                <Bar isAnimationActive={false} dataKey="Sem Resposta %" fill="#dc2626" />
                <Bar isAnimationActive={false} dataKey="Inv. Baixo %" fill="#e07a00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Por grupo de canal" sub="Meta Lead Ads vs Meta Social vs Google">
          <div className="tbl__wrap" style={{border: 'none'}}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th className="num" style={{textAlign:'right'}}>Leads</th>
                  <th className="num" style={{textAlign:'right'}}>% Conv</th>
                  <th className="num" style={{textAlign:'right'}}>% Reu</th>
                  <th className="num" style={{textAlign:'right'}}>% Sem resp</th>
                </tr>
              </thead>
              <tbody>
                {grupoRows.map(r => (
                  <tr key={r.grupo}>
                    <td><b>{r.grupo}</b></td>
                    <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(r.total)}</td>
                    <td className="num" style={{textAlign:'right'}}><span className="blue">{RM.fmtPct(r.pctConv, 2)}</span></td>
                    <td className="num" style={{textAlign:'right'}}>{RM.fmtPct(r.pctReu, 2)}</td>
                    <td className="num" style={{textAlign:'right'}}>{RM.fmtPct(r.pctSem, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {top && worst && (
            <Insight>
              Maior conversão+reunião: <span className="blue">{RM.ORIGEM_LABEL[top.origem]}</span> ({RM.fmtPct(top.pctConv+top.pctReu, 2)}).
              Maior sem-resposta: <b>{RM.ORIGEM_LABEL[worst.origem]}</b> ({RM.fmtPct(worst.pctSem, 1)}).
              Considerar pausar criativos de canais com sem-resposta &gt; 10%.
            </Insight>
          )}
        </Card>
      </div>

    </div>
  );
}

window.SecOrigem = SecOrigem;
