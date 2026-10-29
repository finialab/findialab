document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.mobile-menu');
  const nav = document.querySelector('.main-nav');
  if (menu && nav) menu.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); menu.textContent = open ? '×' : '☰'; });
  document.querySelectorAll('[data-toc-target]').forEach(a => a.addEventListener('click', () => { const id = a.dataset.tocTarget; const target = document.getElementById(id); if (target) target.scrollIntoView({behavior:'smooth'}); }));
  const form = document.querySelector('[data-live-search]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  if (!form || !results) return;
  const root = document.body.dataset.root || './';
  const qInput = form.querySelector('input[name="q"]');
  const params = new URLSearchParams(location.search); if (qInput && !qInput.value) qInput.value = params.get('q') || '';
  fetch(root + 'data/articles.json').then(r => { if (!r.ok) throw new Error('No se pudo cargar el índice'); return r.json(); }).then(items => {
    const render = () => {
      const q = (qInput.value || '').trim().toLocaleLowerCase('es');
      const matches = q ? items.filter(p => (p.title+' '+p.desc+' '+p.category+' '+p.keywords).toLocaleLowerCase('es').includes(q)) : items;
      status.textContent = q ? `${matches.length} guía(s) para “${qInput.value.trim()}”` : `${items.length} guías disponibles. Escribe una búsqueda para filtrar.`;
      results.innerHTML = matches.length ? matches.map(p => `<article class="article-card"><a class="card-link" href="${root}${p.url}"><div class="card-meta"><span class="category-dot dot-${p.color}"></span><span>${p.category}</span><span class="meta-sep">·</span><span>${p.minutes} min</span></div><h3>${p.title}</h3><p>${p.desc}</p><span class="read-link">Leer guía <span aria-hidden="true">↗</span></span></a></article>`).join('') : '<div class="empty-results">No hay coincidencias exactas. Prueba con “ChatGPT”, “ETF”, “cripto”, “NFT” o “alertas”.</div>';
    };
    form.addEventListener('submit', e => { e.preventDefault(); render(); const u = new URL(location.href); u.searchParams.set('q',qInput.value); history.replaceState({},'',u); });
    qInput.addEventListener('input', render); render();
  }).catch(() => { status.textContent='No se ha podido cargar el buscador. Puedes navegar por las categorías desde el menú.'; });
});
