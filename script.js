/* ═══════════════════════════════════════════════════════════
   A COMUNA DE MARCELO — script.js
   ═══════════════════════════════════════════════════════════ */

const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const now = new Date();
document.getElementById('headerDate').textContent =
  `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;

let posts = [];

// ── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('posts.json');
    posts = await res.json();
  } catch(e) {
    posts = [
      {
        id: "001",
        data: "2026-04-20",
        manchete: "\"Comunista de iPhone\" faz sentido? A Estética da Abundância e o macOS como Horizonte Tecnológico do Realismo Socialista",
        resumo: "Existe um senso comum de que a adesão ao socialismo implica renúncia à qualidade. O 'comunista de iPhone' é tido como hipocrisia. Mas será que é? O materialismo histórico responde.",
        corpo: "**Introdução: O Mito da Escassez Programada**\n\nExiste um senso comum, alimentado tanto por defensores fervorosos do livre mercado quanto por críticos superficiais da esquerda, de que a adesão ao socialismo implica uma renúncia à qualidade estética e funcional.",
        tabela: {
          headers: ["Recurso", "Visão Microsoft (Extração)", "Visão macOS (Valor de Uso)"],
          rows: [
            ["Atualizações", "Forçadas, para inserir anúncios e telemetria.", "Focadas em segurança e refinamento de UX."],
            ["Software Office", "Assinatura mensal (Office 365).", "Incluído no sistema como ferramenta de base."],
            ["Hardware", "Fragmentado; obsolescência rápida para venda de licenças.", "Longevo; otimizado para o máximo de performance/watt."],
            ["Foco", "O acionista e a coleta de dados.", "A experiência de uso e a produtividade."]
          ]
        }
      },
      {
        id: "002",
        data: "2026-04-20",
        manchete: "Título Temporário",
        resumo: "Em breve.",
        corpo: "Working in progress."
      }
    ];
  }

  buildTicker();
  buildGrid();
  handleHash(); // Abre artigo directo se URL tiver #post-XXX
}

// ── Format date ───────────────────────────────────────────────────────────────
function fmtDate(str) {
  const [y, m, d] = str.split('-');
  return `${d} de ${months[parseInt(m)-1]} de ${y}`;
}

// ── Ticker ────────────────────────────────────────────────────────────────────
let tickerIndex = 0;
let tickerTimer;

function buildTicker() {
  const slides = document.getElementById('tickerSlides');
  const dots   = document.getElementById('tickerDots');
  slides.innerHTML = '';
  dots.innerHTML = '';

  posts.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'ticker-slide' + (i === 0 ? ' active' : '');
    slide.innerHTML = `
      <a href="#post-${p.id}" onclick="openArticle(${i}); return false;">${p.manchete}</a>
      <span class="ticker-date">${fmtDate(p.data)}</span>
    `;
    slides.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = 'ticker-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => setTicker(i);
    dots.appendChild(dot);
  });

  tickerTimer = setInterval(() => setTicker((tickerIndex + 1) % posts.length), 4000);
}

function setTicker(idx) {
  document.querySelectorAll('.ticker-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
  document.querySelectorAll('.ticker-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  tickerIndex = idx;
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function buildGrid() {
  const grid = document.getElementById('articlesGrid');
  grid.innerHTML = '';

  posts.forEach((p, i) => {
    const row = document.createElement('a');
    row.className = 'article-row';
    row.href = `#post-${p.id}`;
    row.onclick = (e) => { e.preventDefault(); openArticle(i); };
    row.innerHTML = `
      <div class="article-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="article-body">
        <p class="article-date">${fmtDate(p.data)}</p>
        <h2 class="article-title">${p.manchete}</h2>
        <p class="article-resumo">${p.resumo}</p>
      </div>
      <span class="article-arrow">→</span>
    `;
    grid.appendChild(row);

    // Animate in with staggered delay
    requestAnimationFrame(() => {
      setTimeout(() => row.classList.add('visible'), i * 60);
    });
  });
}

// ── Markdown inline renderer ──────────────────────────────────────────────────
function renderInline(text) {
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  return text;
}

// ── Open Article ──────────────────────────────────────────────────────────────
function openArticle(idx) {
  const p = posts[idx];

  document.getElementById('apEyebrow').textContent = `Publicação Nº ${String(idx+1).padStart(3,'0')}`;
  document.getElementById('apTitle').textContent = p.manchete;
  document.getElementById('apDate').textContent = fmtDate(p.data);

  // Build body
  const bodyEl = document.getElementById('apBody');
  bodyEl.innerHTML = '';

  const lines = p.corpo.split('\n');
  let html = '';
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      html += `<strong>${trimmed.slice(2,-2)}</strong>`;
    } else {
      html += `<p>${renderInline(trimmed)}</p>`;
    }
  });
  bodyEl.innerHTML = html;

  // Table if exists
  if (p.tabela) {
    const tbl = document.createElement('table');
    tbl.className = 'dialectic-table';
    tbl.innerHTML = `<caption>Tabela Comparativa de Perspectiva Dialética</caption>`;
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    p.tabela.headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    tbl.appendChild(thead);
    const tbody = document.createElement('tbody');
    p.tabela.rows.forEach(r => {
      const tr = document.createElement('tr');
      r.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    bodyEl.appendChild(tbl);
  }

  // Update URL hash (link único por artigo)
  history.pushState({ postId: p.id }, '', `#post-${p.id}`);

  document.getElementById('frontPage').classList.add('hidden');
  document.getElementById('articlePage').classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Share button ──────────────────────────────────────────────────────────────
function shareArticle() {
  const url = window.location.href;
  const btn = document.getElementById('shareBtn');

  navigator.clipboard.writeText(url).then(() => {
    btn.textContent = '✓ Link copiado!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '⎘ Partilhar';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback para browsers mais antigos
    prompt('Copia este link:', url);
  });
}

// ── Navigation ────────────────────────────────────────────────────────────────
function navigateTo(sectionId) {
  showFront();
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 50);
}

function showFront() {
  history.pushState({}, '', window.location.pathname);
  document.getElementById('frontPage').classList.remove('hidden');
  document.getElementById('articlePage').classList.remove('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Hash URL handling (links directos para artigos) ───────────────────────────
function handleHash() {
  const hash = window.location.hash; // ex: #post-001
  if (!hash.startsWith('#post-')) return;
  const id = hash.replace('#post-', '');
  const idx = posts.findIndex(p => p.id === id);
  if (idx !== -1) openArticle(idx);
}

// Quando o utilizador clica no botão "Voltar" do browser
window.addEventListener('popstate', () => {
  if (!window.location.hash) {
    showFront();
  } else {
    handleHash();
  }
});

init();
