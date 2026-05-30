// Build script to regenerate index.html from website_data.json
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'website_data.json');
const OUTPUT_FILE = path.join(__dirname, 'index.html');

const CSS = `
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
.tag-more{padding:6px 12px;border:1px dashed #ccc;border-radius:20px;background:transparent;cursor:pointer;font-size:13px;color:#888;transition:all .2s}
.tag-more:hover{border-color:#667eea;color:#667eea}
body.dark .tag-more{border-color:#555;color:#777}
body.dark .tag-more:hover{border-color:#8b9cf7;color:#8b9cf7}
.filters.collapsed .filter-btn:nth-child(n+22){display:none}
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
`.trim();

const JS_CODE = `
var data = DATA_PLACEHOLDER;
var tagList = [];
var activeTag = null;
var darkMode = localStorage.getItem('dark') === 'true';
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
  localStorage.setItem('dark', darkMode);
  document.querySelector('.theme-toggle').textContent = darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19';
}
if (darkMode) { document.body.classList.add('dark'); document.querySelector('.theme-toggle').textContent = '\u2600\uFE0F'; }
var tagsExpanded = false;
var HOT_TAG_COUNT = 20;
function renderTags() {
  var el = document.getElementById('tagFilters');
  el.innerHTML = '';
  var allBtn = document.createElement('button');
  allBtn.className = 'filter-btn' + (activeTag ? '' : ' active');
  allBtn.textContent = '\u5168\u90E8';
  allBtn.addEventListener('click', function() { setTag(null); });
  el.appendChild(allBtn);
  var showCount = tagsExpanded ? tagList.length : HOT_TAG_COUNT;
  tagList.forEach(function(tc, idx) {
    if (!tagsExpanded && idx >= HOT_TAG_COUNT && activeTag !== tc[0]) return;
    var t = tc[0], c = tc[1];
    var btn = document.createElement('button');
    btn.className = 'filter-btn' + (activeTag === t ? ' active' : '');
    btn.textContent = t + ' (' + c + ')';
    btn.addEventListener('click', function() { setTag(t); });
    el.appendChild(btn);
  });
  if (tagList.length > HOT_TAG_COUNT) {
    var moreBtn = document.createElement('button');
    moreBtn.className = 'tag-more';
    moreBtn.textContent = tagsExpanded ? '\u6536\u8D77 \u25B2' : '\u66F4\u591A (' + (tagList.length - HOT_TAG_COUNT) + ') \u25BC';
    moreBtn.addEventListener('click', function() { tagsExpanded = !tagsExpanded; renderTags(); });
    el.appendChild(moreBtn);
  }
}
function renderArticles() {
  var filtered = activeTag ? data.filter(function(a) { return a.tags && a.tags.includes(activeTag); }) : data;
  var stats = document.getElementById('stats');
  stats.textContent = '\u5171 ' + filtered.length + ' \u7BC7\u6587\u7AE0' + (activeTag ? ' (\u7B5B\u9009: ' + activeTag + ')' : '');
  var el = document.getElementById('articles');
  if (filtered.length === 0) {
    el.innerHTML = '<div class="no-results">\u672A\u627E\u5230\u76F8\u5173\u6587\u7AE0</div>';
    return;
  }
  var html = '';
  filtered.forEach(function(a, i) {
    html += '<div class="article" data-idx="' + i + '">';
    html += '<h3>' + esc(a.title) + '</h3>';
    html += '<div class="meta">' + esc(a.weekTitle || '') + '</div>';
    if (a.summary) html += '<div class="summary">' + esc(a.summary) + '</div>';
    if (a.tags && a.tags.length > 0) {
      html += '<div class="tags">';
      a.tags.forEach(function(t) { html += '<span class="tag">' + esc(t) + '</span>'; });
      html += '</div>';
    }
    if (a.quote) html += '<div class="quote">' + esc(a.quote) + '</div>';
    html += '<button class="read-btn">\u9605\u8BFB\u5168\u6587</button>';
    html += '</div>';
  });
  el.innerHTML = html;
  el.querySelectorAll('.article').forEach(function(card) {
    card.addEventListener('click', function() { openModal(parseInt(card.dataset.idx)); });
  });
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
  var a = data[idx];
  document.getElementById('modalTitle').textContent = a.title;
  var body = document.getElementById('modalBody');
  body.innerHTML = '';
  if (a.content) {
    var paragraphs = a.content.indexOf('\\n\\n') !== -1
      ? a.content.split('\\n\\n')
      : a.content.split('\\n');
    paragraphs.forEach(function(p) {
      if (p.trim()) {
        var div = document.createElement('p');
        div.textContent = p.trim();
        body.appendChild(div);
      }
    });
  }
  document.getElementById('modalQuote').textContent = a.quote || '';
  var tagsEl = document.getElementById('modalTags');
  tagsEl.innerHTML = '';
  if (a.tags) a.tags.forEach(function(t) {
    var span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    tagsEl.appendChild(span);
  });
  document.getElementById('modalOverlay').classList.add('show');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
var searchInput = document.getElementById('searchInput');
var searchTimeout;
searchInput.addEventListener('input', function() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(function() {
    var q = searchInput.value.trim().toLowerCase();
    if (q.length < 2) { setTag(null); return; }
    var filtered = data.filter(function(a) {
      var title = (a.title || '').toLowerCase();
      var summary = (a.summary || '').toLowerCase();
      var content = (a.content || '').toLowerCase();
      var tags = (a.tags || []).join(' ').toLowerCase();
      return title.includes(q) || summary.includes(q) || content.includes(q) || tags.includes(q);
    });
    document.getElementById('stats').textContent = '\u641C\u7D22 "' + esc(q) + '" \u627E\u5230 ' + filtered.length + ' \u7BC7';
    var el = document.getElementById('articles');
    if (filtered.length === 0) {
      el.innerHTML = '<div class="no-results">\u672A\u627E\u5230\u76F8\u5173\u6587\u7AE0</div>';
      return;
    }
    var html = '';
    filtered.forEach(function(a, i) {
      var realIdx = data.indexOf(a);
      html += '<div class="article" data-idx="' + realIdx + '">';
      html += '<h3>' + esc(a.title) + '</h3>';
      html += '<div class="meta">' + esc(a.weekTitle || '') + '</div>';
      if (a.summary) html += '<div class="summary">' + esc(a.summary) + '</div>';
      html += '<button class="read-btn">\u9605\u8BFB\u5168\u6587</button>';
      html += '</div>';
    });
    el.innerHTML = html;
    el.querySelectorAll('.article').forEach(function(card) {
      card.addEventListener('click', function() { openModal(parseInt(card.dataset.idx)); });
    });
  }, 300);
});
var tagCount = {};
data.forEach(function(a) {
  if (a.tags) a.tags.forEach(function(t) {
    tagCount[t] = (tagCount[t] || 0) + 1;
  });
});
tagList = Object.entries(tagCount).sort(function(a,b) { return b[1] - a[1]; });
renderTags();
renderArticles();
`.trim();

async function main() {
  console.log('Reading data from:', DATA_FILE);
  
  let rawData;
  try {
    rawData = fs.readFileSync(DATA_FILE, 'utf8');
  } catch (err) {
    console.error('Error reading data file:', err.message);
    console.log('Trying backup file...');
    const backupFile = DATA_FILE + '.backup';
    rawData = fs.readFileSync(backupFile, 'utf8');
  }
  
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing JSON:', err.message);
    process.exit(1);
  }
  
  if (data.Count !== undefined) {
    data = data.filter(item => item && typeof item === 'object' && item.title);
  }
  
  console.log('Total articles:', data.length);
  
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
  
  // Build the HTML by concatenation (no template literals to avoid escaping issues)
  const dataJson = JSON.stringify(data);
  
  const html = '<!DOCTYPE html>\n' +
    '<html lang="zh-CN">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>周刊素材库</title>\n' +
    '<style>\n' + CSS + '\n</style>\n' +
    '</head>\n' +
    '<body>\n' +
    '<div class="header">\n' +
    '  <h1>\uD83D\uDCDA 周刊素材库</h1>\n' +
    '  <p>' + placeholder + '</p>\n' +
    '  <button class="theme-toggle" onclick="toggleTheme()">\uD83C\uDF19</button>\n' +
    '</div>\n' +
    '<div class="container">\n' +
    '  <div class="search-box">\n' +
    '    <input type="text" id="searchInput" placeholder="搜索标题、摘要、标签、全文内容...">\n' +
    '    <div class="filters" id="tagFilters"></div>\n' +
    '  </div>\n' +
    '  <div class="stats" id="stats"></div>\n' +
    '  <div id="articles"></div>\n' +
    '</div>\n' +
    '<div class="modal-overlay" id="modalOverlay">\n' +
    '  <div class="modal">\n' +
    '    <div class="modal-header">\n' +
    '      <h2 id="modalTitle"></h2>\n' +
    '      <button class="modal-close" onclick="closeModal()">&times;</button>\n' +
    '    </div>\n' +
    '    <div class="modal-body" id="modalBody"></div>\n' +
    '    <div class="modal-footer">\n' +
    '      <div class="quote" id="modalQuote"></div>\n' +
    '      <div class="tags" id="modalTags"></div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>\n' +
    '<script>\n' +
    JS_CODE.replace('DATA_PLACEHOLDER', dataJson) +
    '\n</script>\n' +
    '</body>\n' +
    '</html>';
  
  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
  console.log('Written:', OUTPUT_FILE);
  console.log('Size:', (fs.statSync(OUTPUT_FILE).length / 1024 / 1024).toFixed(2), 'MB');
  
  // Validate the JS
  const vm = require('vm');
  const scriptContent = JS_CODE.replace('DATA_PLACEHOLDER', dataJson);
  try {
    new vm.Script(scriptContent, { filename: 'test.js' });
    console.log('JS validation: PASSED');
  } catch(e) {
    console.error('JS validation FAILED:', e.message);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
