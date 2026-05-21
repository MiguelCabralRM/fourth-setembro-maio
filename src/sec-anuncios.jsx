/* Seção 6 — Análise dos Anúncios */

function parseAdName(name) {
  if (!name) return null;
  const out = { name, motivo: '', hook: '', publico: '', influencer: '', len: '' };
  // Try to extract m-..., h-..., p-..., i-..., len-...
  const parts = name.split('_');
  let acc = '';
  let curKey = null;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (/^m-/.test(p)) { curKey = 'motivo'; acc = p.replace(/^m-/, ''); }
    else if (/^h-/.test(p)) { if (curKey) out[curKey] = acc; curKey = 'hook'; acc = p.replace(/^h-/, ''); }
    else if (/^p-/.test(p)) { if (curKey) out[curKey] = acc; curKey = 'publico'; acc = p.replace(/^p-/, ''); }
    else if (/^i-/.test(p)) { if (curKey) out[curKey] = acc; curKey = 'influencer'; acc = p.replace(/^i-/, ''); }
    else if (/^len-/.test(p)) { if (curKey) out[curKey] = acc; curKey = 'len'; acc = p.replace(/^len-/, ''); }
    else { acc += '_' + p; }
  }
  if (curKey) out[curKey] = acc;
  return out;
}

function SecAnuncios({ records, meta, filters, setFilters }) {
  const valid = records.filter(RM.isValid);

  // Group by anuncio
  const byAd = {};
  for (const r of valid) {
    if (!r.anuncio) continue;
    if (!byAd[r.anuncio]) byAd[r.anuncio] = [];
    byAd[r.anuncio].push(r);
  }

  const adRows = Object.entries(byAd).map(([nome, recs]) => {
    const total = recs.length;
    const cats = RM.countBy(recs, 'categoria');
    const conv = cats['Convertido'] || 0;
    const reu = cats['Reunião'] || 0;
    const sem = cats['Sem Resposta'] || 0;
    const inv = cats['Baixo Investimento'] || 0;
    const ema = cats['Em andamento'] || 0;
    const parsed = parseAdName(nome);
    return {
      nome,
      parsed,
      total,
      conv, reu, sem, inv, ema,
      pctConv: total > 0 ? (conv/total)*100 : 0,
      pctReu: total > 0 ? (reu/total)*100 : 0,
      pctSem: total > 0 ? (sem/total)*100 : 0,
      pctQualif: total > 0 ? ((conv+reu+ema)/total)*100 : 0,
    };
  });

  const topVolume = adRows.slice().sort((a,b) => b.total - a.total).slice(0, 10);
  // For rates, require at least 30 leads to be meaningful
  const adsBig = adRows.filter(a => a.total >= 30);
  const topConv = adsBig.slice().sort((a,b) => b.pctConv - a.pctConv).filter(a => a.conv > 0).slice(0, 5);
  const topReu = adsBig.slice().sort((a,b) => b.pctReu - a.pctReu).slice(0, 5);
  const piores = adsBig.slice().sort((a,b) => b.pctSem - a.pctSem).slice(0, 5);

  // Aggregate by hook (h-)
  const byHook = {};
  for (const a of adRows) {
    const h = a.parsed?.hook || 'sem hook';
    if (!byHook[h]) byHook[h] = { hook: h, total: 0, conv: 0, reu: 0, ema: 0, sem: 0 };
    byHook[h].total += a.total;
    byHook[h].conv += a.conv;
    byHook[h].reu += a.reu;
    byHook[h].ema += a.ema;
    byHook[h].sem += a.sem;
  }
  const hookRows = Object.values(byHook)
    .filter(h => h.total >= 50)
    .map(h => ({
      ...h,
      pctConv: (h.conv/h.total)*100,
      pctReu: (h.reu/h.total)*100,
      pctQualif: ((h.conv+h.reu+h.ema)/h.total)*100,
      pctSem: (h.sem/h.total)*100,
    }))
    .sort((a,b) => b.total - a.total)
    .slice(0, 10);

  // Aggregate by motivo (m-)
  const byMot = {};
  for (const a of adRows) {
    const m = a.parsed?.motivo || 'sem motivo';
    if (!byMot[m]) byMot[m] = { motivo: m, total: 0, conv: 0, reu: 0, ema: 0, sem: 0 };
    byMot[m].total += a.total;
    byMot[m].conv += a.conv;
    byMot[m].reu += a.reu;
    byMot[m].ema += a.ema;
    byMot[m].sem += a.sem;
  }
  const motRows = Object.values(byMot)
    .filter(m => m.total >= 50)
    .map(m => ({
      ...m,
      pctConv: (m.conv/m.total)*100,
      pctReu: (m.reu/m.total)*100,
      pctQualif: ((m.conv+m.reu+m.ema)/m.total)*100,
      pctSem: (m.sem/m.total)*100,
    }))
    .sort((a,b) => b.total - a.total)
    .slice(0, 8);

  function AdCell({ row }) {
    return (
      <td>
        <code style={{
          fontSize: 11,
          fontFamily: 'ui-monospace, SF Mono, monospace',
          color: 'var(--rm-gray-600)',
          background: 'var(--rm-gray-100)',
          padding: '2px 6px',
          borderRadius: 4,
          display: 'inline-block',
          maxWidth: 320,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }} title={row.nome}>
          {row.nome}
        </code>
        {row.parsed && (
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--rm-gray-500)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {row.parsed.motivo && <span>motivo: <b style={{color:'var(--rm-ink)', fontWeight: 600}}>{row.parsed.motivo}</b></span>}
            {row.parsed.hook && <span>hook: <b style={{color:'var(--rm-ink)', fontWeight: 600}}>{row.parsed.hook}</b></span>}
            {row.parsed.publico && <span>público: <b style={{color:'var(--rm-ink)', fontWeight: 600}}>{row.parsed.publico}</b></span>}
            {row.parsed.influencer && <span>influencer: <b style={{color:'var(--rm-ink)', fontWeight: 600}}>{row.parsed.influencer}</b></span>}
            {row.parsed.len && <span>len: <b style={{color:'var(--rm-ink)', fontWeight: 600}}>{row.parsed.len}</b></span>}
          </div>
        )}
      </td>
    );
  }

  function AdTable({ rows, sortLabel, highlight }) {
    return (
      <div className="tbl__wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Anúncio</th>
              <th className="num" style={{textAlign:'right'}}>Leads</th>
              <th className="num" style={{textAlign:'right'}}>Conv.</th>
              <th className="num" style={{textAlign:'right'}}>Reu.</th>
              <th className="num" style={{textAlign:'right'}}>{sortLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.nome}>
                <AdCell row={row} />
                <td className="num" style={{textAlign:'right'}}><b>{RM.fmtInt(row.total)}</b></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(row.conv)}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(row.reu)}</td>
                <td className="num" style={{textAlign:'right'}}>
                  <b style={{color: highlight==='good' ? 'var(--rm-blue)' : highlight==='bad' ? '#dc2626' : 'var(--rm-ink)'}}>
                    {RM.fmtPct(row[sortLabel === '% Conv' ? 'pctConv' : sortLabel === '% Reu' ? 'pctReu' : 'pctSem'], 2)}
                  </b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <PageHead
        eyebrow="06 · Anúncios"
        title="O que está performando criativo a criativo"
        lead={`Padrão do nome do anúncio: <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;font-size:0.92em;">m-[motivo]_h-[hook]_p-[público]_i-[influencer]_len-[duração]</code>. Quebramos por anúncio, hook e motivo. Filtros mínimos: ≥30 leads por anúncio, ≥50 por hook/motivo.`}
      />
      <FilterBar filters={filters} setFilters={setFilters} totalCount={window.__DATA.crm.length} filteredCount={records.length} />
      <FilterBarExpanded filters={filters} setFilters={setFilters} />

      <SectionHead title="Top 10 anúncios por volume" hint="Quem trouxe mais lead — não necessariamente o melhor" />
      <AdTable rows={topVolume} sortLabel="% Conv" />

      <div className="grid grid--2" style={{marginTop: 20}}>
        <Card title="Top 5 — Maior taxa de fechamento" sub="≥30 leads · Conv. real (Fechamento + Assistência)">
          {topConv.length > 0
            ? <AdTable rows={topConv} sortLabel="% Conv" highlight="good" />
            : <div style={{padding: 20, color: 'var(--rm-gray-500)'}}>Nenhum anúncio com fechamento e volume mínimo no filtro.</div>}
        </Card>
        <Card title="Top 5 — Maior taxa de reunião" sub="≥30 leads · Reuniões agendadas">
          <AdTable rows={topReu} sortLabel="% Reu" highlight="good" />
        </Card>
      </div>

      <SectionHead title="Piores 5 — Maior taxa de Sem Resposta" hint="Anúncios que atraem lead frio (≥30 leads)" />
      <AdTable rows={piores} sortLabel="% Sem" highlight="bad" />

      <SectionHead title="Por hook" hint="Agrupado pelo segmento h-[hook] · ≥50 leads" />
      <div className="tbl__wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Hook</th>
              <th className="num" style={{textAlign:'right'}}>Leads</th>
              <th className="num" style={{textAlign:'right'}}>% Qualificação</th>
              <th className="num" style={{textAlign:'right'}}>% Conv</th>
              <th className="num" style={{textAlign:'right'}}>% Reu</th>
              <th className="num" style={{textAlign:'right'}}>% Sem resp</th>
            </tr>
          </thead>
          <tbody>
            {hookRows.map(h => (
              <tr key={h.hook}>
                <td><b style={{color:'var(--rm-ink)'}}>{h.hook}</b></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(h.total)}</td>
                <td className="num" style={{textAlign:'right'}}><span className="blue">{RM.fmtPct(h.pctQualif, 1)}</span></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtPct(h.pctConv, 2)}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtPct(h.pctReu, 2)}</td>
                <td className="num" style={{textAlign:'right', color: h.pctSem > 10 ? '#dc2626' : undefined}}>{RM.fmtPct(h.pctSem, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHead title="Por motivo" hint="Agrupado pelo segmento m-[motivo] · ≥50 leads" />
      <div className="tbl__wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Motivo</th>
              <th className="num" style={{textAlign:'right'}}>Leads</th>
              <th className="num" style={{textAlign:'right'}}>% Qualificação</th>
              <th className="num" style={{textAlign:'right'}}>% Conv</th>
              <th className="num" style={{textAlign:'right'}}>% Reu</th>
              <th className="num" style={{textAlign:'right'}}>% Sem resp</th>
            </tr>
          </thead>
          <tbody>
            {motRows.map(m => (
              <tr key={m.motivo}>
                <td><b style={{color:'var(--rm-ink)'}}>{m.motivo}</b></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtInt(m.total)}</td>
                <td className="num" style={{textAlign:'right'}}><span className="blue">{RM.fmtPct(m.pctQualif, 1)}</span></td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtPct(m.pctConv, 2)}</td>
                <td className="num" style={{textAlign:'right'}}>{RM.fmtPct(m.pctReu, 2)}</td>
                <td className="num" style={{textAlign:'right', color: m.pctSem > 10 ? '#dc2626' : undefined}}>{RM.fmtPct(m.pctSem, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Insight>
        <b>{RM.fmtInt(adRows.length)}</b> anúncios distintos identificados no CRM. Os 10 maiores por volume representam <b>{RM.fmtPct((topVolume.reduce((s,a)=>s+a.total,0) / valid.length)*100, 1)}</b> dos leads — alta concentração em poucos criativos.
        Considerar testar variações de <span className="blue">hook</span> e <span className="blue">motivo</span> nos anúncios de melhor qualificação para escalar com qualidade.
      </Insight>

    </div>
  );
}

window.SecAnuncios = SecAnuncios;
