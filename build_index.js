// Build script to regenerate index.html from website_data.json
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'website_data.json');
const OUTPUT_FILE = path.join(__dirname, 'index.html');

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>周刊素材库</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f5f5;color:#333;transition:background .3s,color .3s}
body.dark{background:#1a1a2e;color:#e0e0e0}
.header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px;text-align:center;position:relative}
.header h1{font-size:24px;margin-bottom:8px}
.header p{opacity:.9;font-size:14px}
.theme-toggle{position:absolute;top:20px;right:20px;background:rgba(255,255,255,.2);border:none;color:#fff;padding:6px 12px;border-radius:20px;cursor:pointer;font-size:14px}
.container{max-width:900px;margin:0 auto;padding:20px}
.search-box{background:#fff;border-radius:8px;padding:15px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:background .3s}
body.dark .search-box{background:#2a2a4a}
.search-box input{width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:16px;background:#fff;color:#333;transition:background .3s,color .3s}
body.dark .search-box input{background:#1a1a2e;color:#e0e0e0;border-color:#444}
.search-box input:focus{outline:none;border-color:#667eea}
.filters{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.filter-btn{padding:6px 12px;border:1px solid #ddd;border-radius:20px;background:#fff;cursor:pointer;font-size:13px;transition:all .2s}
body.dark .filter-btn{background:#2a2a4a;color:#e0e0e0;border-color:#444}
.filter-btn.active{background:#667eea;color:#fff;border-color:#667eea}
.stats{text-align:center;color:#666;font-size:14px;margin-bottom:15px}
body.dark .stats{color:#aaa}
.article{background:#fff;border-radius:8px;padding:15px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,.1);cursor:pointer;transition:background .3s,transform .2s}
body.dark .article{background:#2a2a4a}
.article:hover{transform:translateY(-2px)}
.article h3{font-size:16px;margin-bottom:8px;color:#333}
body.dark .article h3{color:#e0e0e0}
.article .meta{color:#999;font-size:12px;margin-bottom:8px}
.article .summary{font-size:14px;line-height:1.6;color:#555;margin-bottom:10px}
body.dark .article .summary{color:#bbb}
.article .tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{background:#f0f0f0;padding:3px 8px;border-radius:12px;font-size:12px;color:#666}
body.dark .tag{background:#3a3a5a;color:#bbb}
.article .quote{background:#fff9e6;border-left:3px solid #ffc107;padding:10px;margin:10px 0;font-size:13px;color:#666;font-style:italic}
body.dark .article .quote{background:#2a2a1a;color:#ccc}
.read-btn{background:#667eea;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;margin-top:8px}
.read-btn:hover{background:#5a6fd6}
.modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:1000;justify-content:center;align-items:center;padding:20px}
.modal-overlay.show{display:flex}
.modal{background:#fff;border-radius:12px;width:100%;max-width:700px;max-height:85vh;display:flex;flex-direction:column;position:relative}
body.dark .modal{background:#2a2a4a}
.modal-header{padding:20px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:flex-start;flex-shrink:0}
body.dark .modal-header{border-color:#444}
.modal-header h2{font-size:18px;flex:1;padding-right:10px}
.modal-close{background:none;border:none;font-size:24px;cursor:pointer;color:#999;padding:0 5px}
.modal-close:hover{color:#333}
body.dark .modal-close:hover{color:#fff}
.modal-body{padding:20px;overflow-y:auto;flex:1;font-size:15px;line-height:1.8;color:#444}
body.dark .modal-body{color:#ccc}
.modal-body p{margin-bottom:12px}
.modal-footer{padding:15px 20px;border-top:1px solid #eee;flex-shrink:0}
body.dark .modal-footer{border-color:#444}
.modal-footer .quote{background:#fff9e6;border-left:3px solid #ffc107;padding:10px;font-size:13px;color:#666;font-style:italic}
body.dark .modal-footer .quote{background:#2a2a1a;color:#ccc}
.modal-footer .tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.no-results{text-align:center;padding:40px;color:#999}
@media(max-width:600px){
  .header h1{font-size:20px}
  .container{padding:10px}
  .article h3{font-size:15px}
  .modal{max-height:90vh;border-radius:8px}
  .modal-header{padding:15px}
  .modal-body{padding:15px}
}
</style>
</head>
<body>
<div class="header">
  <h1>📚 周刊素材库</h1>
  <p>TOTAL_PLACEHOLDER</p>
  <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
</div>
<div class="container">
  <div class="search-box">
    <input type="text" id="searchInput" placeholder="搜索标题、摘要、标签、全文内容...">
    <div class="filters" id="tagFilters"></div>
  </div>
  <div class="stats" id="stats"></div>
  <div id="articles"></div>
</div>
<div class="modal-overlay" id="modalOverlay">
  <div class="modal">
    <div class="modal-header">
      <h2 id="modalTitle"></h2>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-footer">
      <div class="quote" id="modalQuote"></div>
      <div class="tags" id="modalTags"></div>
    </div>
  </div>
</div>
<script>
var data = DATA_PLACEHOLDER;
var tagList = [];
var activeTag = null;
var darkMode = localStorage.getItem('dark') === 'true';
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
  localStorage.setItem('dark', darkMode);
  document.querySelector('.theme-toggle').textContent = darkMode ? '☀️' : '🌙';
}
if (darkMode) { document.body.classList.add('dark'); document.querySelector('.theme-toggle').textContent = '☀️'; }
function renderTags() {
  const el = document.getElementById('tagFilters');
  let h = '<button class="filter-btn' + (activeTag ? '' : ' active') + '" onclick="setTag(null)">全部</button>';
  tagList.forEach(([t,c]) => {
    h += '<button class="filter-btn' + (activeTag===t?' active':'') + '" onclick="setTag(\''+t.replace(/'/g,"\\'")+'\')">'+esc(t)+' ('+c+')</button>';
  });
  el.innerHTML = h;
}
function renderArticles() {
  const filtered = activeTag ? data.filter(a => a.tags && a.tags.includes(activeTag)) : data;
  const stats = document.getElementById('stats');
  stats.textContent = '共 ' + filtered.length + ' 篇文章' + (activeTag ? ' (筛选: ' + activeTag + ')' : '');
  const el = document.getElementById('articles');
  if (filtered.length === 0) {
    el.innerHTML = '<div class="no-results">未找到相关文章</div>';
    return;
  }
  let html = '';
  filtered.forEach((a, i) => {
    html += '<div class="article" onclick="openModal(' + i + ')">';
    html += '<h3>' + esc(a.title) + '</h3>';
    html += '<div class="meta">' + esc(a.weekTitle || '') + '</div>';
    if (a.summary) html += '<div class="summary">' + esc(a.summary) + '</div>';
    if (a.tags && a.tags.length > 0) {
      html += '<div class="tags">';
      a.tags.forEach(t => { html += '<span class="tag">' + esc(t) + '</span>'; });
      html += '</div>';
    }
    if (a.quote) html += '<div class="quote">' + esc(a.quote) + '</div>';
    html += '<button class="read-btn">阅读全文</button>';
    html += '</div>';
  });
  el.innerHTML = html;
}
function setTag(tag) {
  activeTag = tag;
  renderTags();
  renderArticles();
}
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function openModal(idx) {
  const a = data[idx];
  document.getElementById('modalTitle').textContent = a.title;
  const body = document.getElementById('modalBody');
  body.innerHTML = '';
  if (a.content) {
    a.content.split('\\n\\n').forEach(p => {
      if (p.trim()) {
        const div = document.createElement('p');
        div.textContent = p.trim();
        body.appendChild(div);
      }
    });
  }
  document.getElementById('modalQuote').textContent = a.quote || '';
  const tagsEl = document.getElementById('modalTags');
  tagsEl.innerHTML = '';
  if (a.tags) a.tags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    tagsEl.appendChild(span);
  });
  document.getElementById('modalOverlay').classList.add('show');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
// Search
const searchInput = document.getElementById('searchInput');
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 2) { setTag(null); return; }
    const filtered = data.filter(a => {
      const title = (a.title || '').toLowerCase();
      const summary = (a.summary || '').toLowerCase();
      const content = (a.content || '').toLowerCase();
      const tags = (a.tags || []).join(' ').toLowerCase();
      return title.includes(q) || summary.includes(q) || content.includes(q) || tags.includes(q);
    });
    document.getElementById('stats').textContent = '搜索 "' + esc(q) + '" 找到 ' + filtered.length + ' 篇';
    const el = document.getElementById('articles');
    if (filtered.length === 0) {
      el.innerHTML = '<div class="no-results">未找到相关文章</div>';
      return;
    }
    let html = '';
    filtered.forEach((a, i) => {
      const realIdx = data.indexOf(a);
      html += '<div class="article" onclick="openModal(' + realIdx + ')">';
      html += '<h3>' + esc(a.title) + '</h3>';
      html += '<div class="meta">' + esc(a.weekTitle || '') + '</div>';
      if (a.summary) html += '<div class="summary">' + esc(a.summary) + '</div>';
      html += '<button class="read-btn">阅读全文</button>';
      html += '</div>';
    });
    el.innerHTML = html;
  }, 300);
});
// Build tag list
const tagCount = {};
data.forEach(a => {
  if (a.tags) a.tags.forEach(t => {
    tagCount[t] = (tagCount[t] || 0) + 1;
  });
});
tagList = Object.entries(tagCount).sort((a,b) => b[1] - a[1]);
// Init
renderTags();
renderArticles();
</script>
</body>
</html>`;

async function main() {
  console.log('Reading data from:', DATA_FILE);
  
  // Read and parse the data file
  let rawData;
  try {
    rawData = fs.readFileSync(DATA_FILE, 'utf8');
  } catch (err) {
    console.error('Error reading data file:', err.message);
    console.log('Trying backup file...');
    const backupFile = DATA_FILE + '.backup';
    rawData = fs.readFileSync(backupFile, 'utf8');
  }
  
  // Parse JSON
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing JSON:', err.message);
    process.exit(1);
  }
  
  // Filter out metadata (keep only arrays)
  if (data.Count !== undefined) {
    data = data.filter(item => item && typeof item === 'object' && item.title);
  }
  
  console.log('Total articles:', data.length);
  
  // Create tag count from data
  const tagCount = {};
  data.forEach(a => {
    if (a.tags) {
      a.tags.forEach(t => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    }
  });
  
  const totalTags = Object.keys(tagCount).length;
  const placeholder = `${data.length}篇精选文章 · ${totalTags}个标签 · 全文阅读`;
  
  // Replace placeholders
  let html = HTML_TEMPLATE
    .replace('TOTAL_PLACEHOLDER', placeholder)
    .replace('DATA_PLACEHOLDER', JSON.stringify(data));
  
  // Write output
  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
  console.log('Written:', OUTPUT_FILE);
  console.log('Size:', (fs.statSync(OUTPUT_FILE).length / 1024 / 1024).toFixed(2), 'MB');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
