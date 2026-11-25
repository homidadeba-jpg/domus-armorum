import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowClockwise, ArrowLeft, ArrowRight, SignOut, LockKey } from '@phosphor-icons/react';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/barlow-condensed/500.css';
import './styles.css';

const periods = [
  { id: 'today', label: 'Hoje' }, { id: 'yesterday', label: 'Ontem' },
  { id: 'week', label: '7 dias' }, { id: 'month', label: '30 dias' }, { id: 'all', label: 'Total' },
];
const number = value => new Intl.NumberFormat('pt-BR').format(value);
const date = value => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(value));

async function api(path, body, signal) {
  let response;
  try {
    response = await fetch('/api/admin/' + path, {
      method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', signal,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (failure) {
    if (failure.name === 'AbortError') throw failure;
    throw new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.');
  }
  const result = await response.json().catch(() => ({ error: 'O painel está indisponível. Tente novamente em instantes.' }));
  if (result.error && response.ok) throw new Error(result.error);
  if (!response.ok) {
    const error = new Error(result.error || 'Não foi possível carregar. Tente novamente.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function Brand() {
  return <a className="admin-brand" href="/" aria-label="Abrir o site da Domus Armorum">
    <img src="/brand/domus-transparente-de24c017.webp" width="32" height="44" alt="" />
    <span>DOMUS<br />ARMORUM</span>
  </a>;
}

function Login({ onLogin }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try { onLogin(await api('login', { username: form.get('username'), password: form.get('password') })); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <main className="admin-auth">
    <Brand />
    <div className="admin-auth-content">
      <h1>Painel de visitas</h1>
      <p>Acompanhe os acessos ao site da Domus Armorum.</p>
      <form onSubmit={submit}>
        <label htmlFor="username">Login</label>
        <input id="username" name="username" autoComplete="username" defaultValue="admin" required maxLength={64} autoCapitalize="none" spellCheck="false" />
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={128} />
        {error && <p role="alert" className="admin-error">{error}</p>}
        <button className="admin-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}<ArrowRight size={18} aria-hidden="true" /></button>
      </form>
    </div>
    <a className="admin-back" href="/"><ArrowLeft size={16} aria-hidden="true" />Voltar ao site</a>
  </main>;
}

function PasswordForm({ required, onSaved, onCancel, onExpired }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    if (values.get('password') !== values.get('confirmation')) { setError('As senhas precisam ser iguais.'); return; }
    setBusy(true);
    setError('');
    try { onSaved(await api('password', { password: values.get('password'), currentPassword: values.get('currentPassword') })); }
    catch (failure) {
      if (failure.status === 401) onExpired();
      else setError(failure.message);
    } finally { setBusy(false); }
  }
  return <section className="admin-password" aria-labelledby="password-heading">
    <LockKey size={28} className="admin-accent" aria-hidden="true" />
    <h1 id="password-heading">{required ? 'Crie sua nova senha' : 'Alterar senha'}</h1>
    <p>{required ? 'Este é seu primeiro acesso. Defina uma senha pessoal para abrir o painel.' : 'Escolha uma nova senha para acessar seu painel.'}</p>
    <form onSubmit={submit}>
      {!required && <><label htmlFor="current-password">Senha atual</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} /></>}
      <label htmlFor="new-password">Nova senha</label>
      <input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} aria-describedby="password-help" />
      <p id="password-help" className="admin-field-help">Use pelo menos 10 caracteres.</p>
      <label htmlFor="confirm-password">Confirmar nova senha</label>
      <input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
      {error && <p role="alert" className="admin-error">{error}</p>}
      <div className="admin-form-actions"><button className="admin-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar senha'}</button>{!required && <button type="button" onClick={onCancel} disabled={busy}>Cancelar</button>}</div>
    </form>
  </section>;
}

function bucketLabel(bucket, data) {
  if (data.hourly) return bucket + 'h';
  if (data.monthly) return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(new Date(bucket + '-01T12:00:00Z'));
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(new Date(bucket + 'T12:00:00Z'));
}

function Chart({ data, metric }) {
  const [selected, setSelected] = useState(null);
  const [width, setWidth] = useState(920);
  const container = useRef(null);
  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(Math.max(260, Math.round(entries[0].contentRect.width))));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const height = width < 600 ? 220 : 260, left = 40, bottom = 35, top = 18;
  const chartHeight = height - bottom - top;
  const maximum = Math.max(4, ...data.series.map(point => point[metric]));
  const ceiling = Math.ceil(maximum / 4) * 4;
  const step = (width - left - 12) / data.series.length;
  const stride = Math.ceil(data.series.length / Math.max(3, Math.floor((width - left) / 75)));
  const selectedPoint = data.series[selected];
  const label = metric === 'views' ? 'visualizações' : 'visitas';
  return <figure className="admin-chart" ref={container} aria-label={`Gráfico de ${label}`}>
    <div className="admin-chart-readout" aria-live="polite">{selectedPoint ? `${bucketLabel(selectedPoint.bucket, data)} · ${number(selectedPoint[metric])} ${label}` : 'Toque em uma coluna para ver o valor.'}</div>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="chart-title">
      <title id="chart-title">{label} por {data.hourly ? 'hora' : data.monthly ? 'mês' : 'dia'}. Valores disponíveis na tabela abaixo.</title>
      {[0, 1, 2, 3, 4].map(index => {
        const y = top + chartHeight * index / 4;
        return <g key={index}><line className="admin-gridline" x1={left} x2={width} y1={y} y2={y} /><text className="admin-axis" x={left - 12} y={y + 4} textAnchor="end">{number(ceiling * (4 - index) / 4)}</text></g>;
      })}
      {data.series.map((point, index) => {
        const barHeight = chartHeight * point[metric] / ceiling;
        const x = left + index * step;
        return <g key={point.bucket} onPointerEnter={() => setSelected(index)} onClick={() => setSelected(index)}>
          <rect className="admin-chart-target" x={x} y={top} width={step} height={chartHeight} />
          <rect className={'admin-bar' + (selected === index ? ' is-selected' : '')} x={x + step * .18} y={top + chartHeight - barHeight} width={step * .64} height={barHeight} rx="2"><title>{bucketLabel(point.bucket, data)} · {number(point[metric])} {label}</title></rect>
          {index % stride === 0 && <text className="admin-axis" textAnchor="middle" x={x + step / 2} y={height - 9}>{bucketLabel(point.bucket, data)}</text>}
        </g>;
      })}
    </svg>
    {data.views === 0 && <figcaption className="admin-empty">Nenhum acesso registrado neste período.</figcaption>}
  </figure>;
}

function Dashboard({ onExpired, notice }) {
  const [period, setPeriod] = useState('week');
  const [metric, setMetric] = useState('views');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    api('stats?period=' + period, null, controller.signal).then(setData).catch(failure => {
      if (failure.name === 'AbortError') return;
      if (failure.status === 401) onExpired();
      else setError(failure.message);
    });
    return () => controller.abort();
  }, [period, refresh, onExpired]);
  const selected = periods.find(item => item.id === period);
  return <main className="admin-dashboard">
    {notice && <p role="status" className="admin-success">Senha alterada com sucesso.</p>}
    <div className="admin-page-heading"><div><h1>Visitas ao site</h1><p>domusarmas.com.br</p></div><button className="admin-refresh" onClick={() => setRefresh(value => value + 1)} disabled={!data && !error}><ArrowClockwise size={18} aria-hidden="true" />Atualizar</button></div>
    <div className="admin-periods" role="group" aria-label="Período dos gráficos">{periods.map(item => <button key={item.id} aria-pressed={period === item.id} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {!data && !error && <div className="admin-loading" role="status">Carregando os acessos…</div>}
    {data && <>
      <div className="admin-stats" aria-label={'Resumo de ' + selected.label}>
        <div><span>Visualizações</span><strong>{number(data.views)}</strong><p>Carregamentos do site</p></div>
        <div><span>Visitas</span><strong>{number(data.visits)}</strong><p>Sessões de navegação</p></div>
      </div>
      <section className="admin-report" aria-labelledby="report-heading">
        <div className="admin-report-heading"><div><h2 id="report-heading">{period === 'all' ? 'Histórico de acessos' : 'Acessos no período'}</h2><p>{date(data.start + 'T12:00:00Z')}{data.start !== data.end && ' a ' + date(data.end + 'T12:00:00Z')}</p></div>
          <div className="admin-metrics" role="group" aria-label="Métrica do gráfico"><button aria-pressed={metric === 'views'} onClick={() => setMetric('views')}>Visualizações</button><button aria-pressed={metric === 'visits'} onClick={() => setMetric('visits')}>Visitas</button></div>
        </div>
        <Chart key={period + metric} data={data} metric={metric} />
        <details className="admin-data-table"><summary>Ver dados em tabela</summary><div className="admin-table-scroll"><table><caption className="admin-sr-only">Acessos de {selected.label}</caption><thead><tr><th scope="col">{data.hourly ? 'Hora' : data.monthly ? 'Mês' : 'Dia'}</th><th scope="col">Visualizações</th><th scope="col">Visitas</th></tr></thead><tbody>{data.series.map(row => <tr key={row.bucket}><th scope="row">{bucketLabel(row.bucket, data)}</th><td>{number(row.views)}</td><td>{number(row.visits)}</td></tr>)}</tbody></table></div></details>
      </section>
      <footer className="admin-report-footer"><p>Desde o início da contagem<strong>{number(data.total.views)} visualizações · {number(data.total.visits)} visitas</strong></p><p>{data.trackingStarted && 'Contagem iniciada em ' + date(data.trackingStarted) + '.'}<br />Horários de Brasília.</p></footer>
      <p className="admin-method">Uma visualização é um carregamento do site. Visitas agrupam carregamentos na mesma aba com intervalo de até 30 minutos, dentro do mesmo dia. Acessos feitos com o painel conectado são desconsiderados.</p>
    </>}
  </main>;
}

function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(false);
  const [notice, setNotice] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  // Stable callback prevents reloading the report on unrelated parent renders.
  const [expire] = useState(() => () => { setUser(null); setSettings(false); setNotice(false); });
  useEffect(() => {
    api('session').then(setUser).catch(failure => {
      if (failure.status !== 401) setError(failure.message);
    }).finally(() => setLoading(false));
  }, []);
  async function logout() {
    setLoggingOut(true);
    try { await api('logout', {}); expire(); }
    catch (failure) { if (failure.status === 401) expire(); else setError(failure.message); }
    finally { setLoggingOut(false); }
  }
  function saved(updated) { setUser(updated); setSettings(false); setNotice(true); }
  if (loading) return <main className="admin-auth"><Brand /><p role="status">Abrindo o painel…</p></main>;
  if (!user) return <>{error && <p role="alert" className="admin-global-error">{error}</p>}<Login onLogin={updated => { setUser(updated); setError(''); }} /></>;
  return <div className="admin-app">
    <header className="admin-header"><Brand /><nav aria-label="Conta do administrador">{!user.mustChangePassword && <button onClick={() => { setSettings(value => !value); setNotice(false); }}><LockKey size={18} aria-hidden="true" />{settings ? 'Voltar aos gráficos' : 'Alterar senha'}</button>}<button onClick={logout} disabled={loggingOut}><SignOut size={18} aria-hidden="true" />{loggingOut ? 'Saindo…' : 'Sair'}</button></nav></header>
    {error && <p role="alert" className="admin-error">{error}</p>}
    {user.mustChangePassword || settings ? <main><PasswordForm required={user.mustChangePassword} onSaved={saved} onCancel={() => setSettings(false)} onExpired={expire} /></main> : <Dashboard onExpired={expire} notice={notice} />}
  </div>;
}

createRoot(document.getElementById('admin-root')).render(<Admin />);
