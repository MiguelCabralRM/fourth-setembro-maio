/* App shell — routing + filter state */

const { useState, useMemo, useEffect } = React;

function getRoute() {
  const h = window.location.hash.replace('#', '') || 'visao-geral';
  const valid = NAV_ITEMS.map(n => n.id);
  return valid.includes(h) ? h : 'visao-geral';
}

function App() {
  const [route, setRoute] = useState(getRoute());
  const [filters, setFilters] = useState({ meses: [], origens: [], categorias: [], faixas: [] });

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (id) => {
    window.location.hash = id;
    setRoute(id);
    window.scrollTo(0, 0);
  };

  const allCrm = window.__DATA.crm;
  const meta = window.__DATA.meta;
  const filtered = useMemo(() => RM.applyFilters(allCrm, filters), [filters]);

  let content;
  const props = { records: filtered, meta, filters, setFilters };
  switch (route) {
    case 'evolucao':     content = <SecEvolucao {...props} />; break;
    case 'qualidade':    content = <SecQualidade {...props} />; break;
    case 'origem':       content = <SecOrigem {...props} />; break;
    case 'investimento': content = <SecInvestimento {...props} />; break;
    case 'anuncios':     content = <SecAnuncios {...props} />; break;
    case 'visao-geral':
    default:             content = <SecVisaoGeral {...props} />;
  }

  return (
    <div className="app">
      <Sidebar current={route} onNavigate={navigate} />
      <main className="main">{content}</main>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
