// A page view is recorded once per load. Visits share an anonymous tab identifier for 30 minutes.
function recordView() {
  if (location.pathname !== '/' || navigator.webdriver) return;
  const now = Date.now();
  let visitId = crypto.randomUUID();
  try {
    const saved = JSON.parse(sessionStorage.getItem('domus-visit') || 'null');
    if (saved && now - saved.lastSeen < 30 * 60 * 1000 && /^[a-f0-9-]{36}$/i.test(saved.id)) visitId = saved.id;
    sessionStorage.setItem('domus-visit', JSON.stringify({ id: visitId, lastSeen: now }));
  } catch { /* Recording still works when browser storage is unavailable. */ }
  fetch('/api/analytics/collect', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: crypto.randomUUID(), visitId }), keepalive: true,
  }).catch(() => {});
}

if (document.visibilityState === 'visible') recordView();
else document.addEventListener('visibilitychange', function onVisible() {
  if (document.visibilityState !== 'visible') return;
  document.removeEventListener('visibilitychange', onVisible);
  recordView();
});
