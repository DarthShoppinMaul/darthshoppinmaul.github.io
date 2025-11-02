
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  all: [],
  activeTags: new Set(),
  q: "",
  sort: "end-desc"
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' });
  return fmt.format(d);
};

const cmp = {
  "end-desc": (a,b) => (b.endDate||"").localeCompare(a.endDate||""),
  "end-asc": (a,b) => (a.endDate||"").localeCompare(b.endDate||""),
  "name-asc": (a,b) => a.title.localeCompare(b.title),
  "name-desc": (a,b) => b.title.localeCompare(a.title) * -1,
};

async function load() {
  const res = await fetch('assets/data/projects.json');
  state.all = await res.json();

  const tags = [...new Set(state.all.flatMap(p => p.tags || []))].sort((a,b) => a.localeCompare(b));

  const chips = $("#chips");
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = tag;
    btn.dataset.tag = tag;
    btn.addEventListener('click', () => {
      if (state.activeTags.has(tag)) state.activeTags.delete(tag);
      else state.activeTags.add(tag);
      btn.classList.toggle('active');
      render();
      syncURL();
    });
    chips.appendChild(btn);
  });

  const params = new URLSearchParams(location.search);
  const q = params.get('q'); if (q) { state.q = q; $('#search').value = q; }
  const sort = params.get('sort'); if (sort) { state.sort = sort; $('#sort').value = sort; }
  const tagsParam = params.get('tags');
  if (tagsParam) {
    tagsParam.split(',').forEach(t => state.activeTags.add(t));
    $$('#chips .chip').forEach(el => {
      if (state.activeTags.has(el.dataset.tag)) el.classList.add('active');
    });
  }

  $('#search').addEventListener('input', (e) => {
    state.q = e.target.value;
    render();
    syncURL();
  });
  $('#sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    render();
    syncURL();
  });

  render();
}

function syncURL() {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.sort !== 'end-desc') params.set('sort', state.sort);
  if (state.activeTags.size) params.set('tags', [...state.activeTags].join(','));
  history.replaceState(null, '', '?' + params.toString());
}

function render() {
  const grid = $('#grid');
  grid.innerHTML = '';

  let items = state.all.slice();
  const q = state.q.trim().toLowerCase();
  if (q) {
    items = items.filter(p => {
      const hay = [p.title, p.summary, ...(p.tags||[]), ...(p.tech||[])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  if (state.activeTags.size) {
    items = items.filter(p => (p.tags||[]).some(t => state.activeTags.has(t)));
  }
  items.sort(cmp[state.sort]);

  $('#count').textContent = items.length.toString();
  items.forEach(p => grid.appendChild(card(p)));
}

function card(p) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="thumb">${thumbHTML(p)}</div>
    <div class="card-body">
      <h3>${escapeHTML(p.title)}</h3>
      <div class="meta">
        ${p.startDate ? `<span>${formatDate(p.startDate)}</span>` : ''}
        ${p.endDate ? `<span>→ ${formatDate(p.endDate)}</span>` : ''}
      </div>
      <p class="small">${escapeHTML(p.summary || '')}</p>
      <div class="badges">${(p.tags||[]).map(t => `<span class="badge">${escapeHTML(t)}</span>`).join('')}</div>
      <div class="kv">${(p.tech||[]).slice(0,5).map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div>
    </div>
    <div class="card-footer">
      ${p.demo ? `<a class="button-outline" href="${p.demo}" target="_blank" rel="noreferrer">Demo</a>` : ''}
      ${p.source ? `<a class="button-outline" href="${p.source}" target="_blank" rel="noreferrer">Source</a>` : ''}
      ${p.caseStudy ? `<a class="button-outline" href="${p.caseStudy}" target="_blank" rel="noreferrer">Case Study</a>` : ''}
    </div>
  `;
  return el;
}

function thumbHTML(p){
  if (p.image) return `<img loading="lazy" src="${p.image}" alt="${escapeHTML(p.title)} cover">`;
  return `<img loading="lazy" src="assets/img/placeholder.svg" alt="">`;
}

function escapeHTML(s){
  return (s||'').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

load();
