#!/usr/bin/env node
// 掃描 mobile/src/data 下的食材資料檔，找出還有欄位是 unverified 的品項，
// 同時產出 docs/VERIFICATION_TODO.md（簡化表格）與 docs/verification-todo.html（可篩選/排序）。

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'mobile', 'src', 'data');
const MD_OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'VERIFICATION_TODO.md');
const HTML_OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'verification-todo.html');

const CATEGORY_FILES = [
  { file: 'vegetables.json', category: '蔬菜' },
  { file: 'fruits.json', category: '水果' },
  { file: 'seafood.json', category: '海鮮' },
  { file: 'meats.json', category: '肉品' },
];

const FIELD_LABELS = {
  nutrition: '營養',
  selectionTips: '挑選技巧',
  months: '產季',
};

// 每個欄位（產季依分類再細分）的建議查證來源說明與參考連結
const FIELD_SOURCES = {
  nutrition: {
    text: '衛福部食藥署「食品營養成分資料庫」（data.gov.tw/dataset/8543）',
    url: 'https://data.gov.tw/dataset/8543',
  },
  selectionTips: {
    text: '需多個彼此獨立的可靠來源查證（政府機關網站、農會／漁會、主流媒體等），一致才可標 secondary',
    url: null,
  },
  months_produce: {
    text: '農糧署「農產品產地產期查詢」／水果月曆',
    url: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=1103',
  },
  months_seafood: {
    text: '無完整官方資料，改用民間整理資料（如食令日曆）交叉驗證，或請教市場攤商',
    url: 'https://www.foodforseason.com/blog/%E7%95%B6%E5%AD%A3%E6%B5%B7%E9%AE%AE/',
  },
};

function sourceKeyFor(field, category) {
  if (field === 'months') {
    return category === '海鮮' ? 'months_seafood' : 'months_produce';
  }
  return field;
}

function collectTodo(item, category) {
  const verification = item.verification || {};
  const fields = ['nutrition', 'selectionTips', 'months'];

  return fields
    .filter((field) => {
      // 肉品的產季已依規則直接標「全年供應」、不需要驗證，不列入待辦
      if (category === '肉品' && field === 'months') return false;
      const entry = verification[field];
      return entry && entry.level === 'unverified';
    })
    .map((field) => ({
      field,
      label: FIELD_LABELS[field],
      sourceKey: sourceKeyFor(field, category),
    }));
}

function scanData() {
  const rows = [];
  let totalItems = 0;
  let doneItems = 0;

  for (const { file, category } of CATEGORY_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const item of items) {
      totalItems += 1;
      const todo = collectTodo(item, category);
      if (todo.length === 0) {
        doneItems += 1;
        continue;
      }
      rows.push({ category, id: item.id, name: item.name, todo });
    }
  }

  return { rows, totalItems, doneItems };
}

function buildMarkdown({ rows, totalItems, doneItems }) {
  const lines = [];
  lines.push('# 資料驗證待辦清單');
  lines.push('');
  lines.push('> 本檔案由 `scripts/check-verification.js` 自動產生，請勿手動編輯；重新執行腳本會覆蓋內容。');
  lines.push('> 想要可篩選、可排序的版本，請看同目錄下的 `verification-todo.html`。');
  lines.push(`> 產生時間：${new Date().toISOString()}`);
  lines.push('');
  lines.push(`共 ${totalItems} 筆食材，其中 ${doneItems} 筆已全部驗證完成，${rows.length} 筆仍有待查證欄位。`);
  lines.push('');

  if (rows.length === 0) {
    lines.push('目前沒有待查證的食材，太棒了！');
    fs.writeFileSync(MD_OUTPUT_FILE, lines.join('\n') + '\n');
    return;
  }

  // 用到哪些來源就列哪些，避免對照表出現用不到的項目
  const usedSourceKeys = new Set();
  for (const row of rows) {
    for (const t of row.todo) usedSourceKeys.add(t.sourceKey);
  }

  lines.push('## 查證來源對照');
  lines.push('');
  const SOURCE_KEY_LABELS = {
    months_produce: '產季（蔬菜／水果）',
    months_seafood: '產季（海鮮）',
  };
  for (const key of usedSourceKeys) {
    const label = SOURCE_KEY_LABELS[key] || FIELD_LABELS[key];
    const source = FIELD_SOURCES[key];
    lines.push(`- **${label}**：${source.text}`);
  }
  lines.push('');

  lines.push('## 待查證清單');
  lines.push('');
  lines.push('| 分類 | 食材 | 待查證欄位 |');
  lines.push('|---|---|---|');
  for (const row of rows) {
    const fieldCol = row.todo.map((t) => t.label).join('、');
    lines.push(`| ${row.category} | ${row.name} | ${fieldCol} |`);
  }
  lines.push('');

  fs.writeFileSync(MD_OUTPUT_FILE, lines.join('\n'));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BADGE_COLORS = {
  nutrition: '#c0392b', // 紅：營養
  selectionTips: '#2464b4', // 藍：挑選技巧
  months: '#b7791f', // 橙：產季
};

function buildHtml({ rows, totalItems, doneItems }) {
  const todoItems = rows.length;

  const tableRows = rows
    .map((row) => {
      const fieldsKey = row.todo.map((t) => t.field).join(',');
      const badges = row.todo
        .map(
          (t) =>
            `<span class="badge" style="background:${BADGE_COLORS[t.field]}">${escapeHtml(t.label)}</span>`
        )
        .join(' ');
      const sources = row.todo
        .map((t) => {
          const source = FIELD_SOURCES[t.sourceKey];
          const inner = source.url
            ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.text)}</a>`
            : escapeHtml(source.text);
          return `<div class="source-line"><strong>${escapeHtml(t.label)}：</strong>${inner}</div>`;
        })
        .join('');

      return `        <tr data-category="${escapeHtml(row.category)}" data-fields="${escapeHtml(fieldsKey)}">
          <td>${escapeHtml(row.category)}</td>
          <td>${escapeHtml(row.name)}</td>
          <td>${badges}</td>
          <td>${sources}</td>
        </tr>`;
    })
    .join('\n');

  const categories = [...new Set(rows.map((r) => r.category))];
  const filterButtons = ['全部', ...categories]
    .map(
      (cat, i) =>
        `<button class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${escapeHtml(cat === '全部' ? '' : cat)}">${escapeHtml(cat)}</button>`
    )
    .join('\n      ');

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>資料驗證待辦清單</title>
<style>
  :root {
    --ink: #1f2e22;
    --muted: #8a8779;
    --paper: #f3f5ee;
    --line: #e4e1d5;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "PingFang TC", "Noto Sans TC", sans-serif;
    background: var(--paper);
    color: var(--ink);
    margin: 0;
    padding: 24px;
  }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .generated-at { color: var(--muted); font-size: 12px; margin-bottom: 20px; }
  .summary {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .summary-card {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 12px 20px;
    min-width: 120px;
  }
  .summary-card .num { font-size: 26px; font-weight: 700; }
  .summary-card .label { font-size: 12px; color: var(--muted); }
  .filters { margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-btn {
    border: 1px solid var(--line);
    background: #fff;
    color: var(--ink);
    border-radius: 999px;
    padding: 6px 16px;
    font-size: 13px;
    cursor: pointer;
  }
  .filter-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
  table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }
  th, td {
    text-align: left;
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 14px;
    vertical-align: top;
  }
  th {
    background: #ece9dc;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }
  th .arrow { font-size: 11px; color: var(--muted); margin-left: 4px; }
  tr:last-child td { border-bottom: none; }
  .badge {
    display: inline-block;
    color: #fff;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    margin: 2px 4px 2px 0;
    white-space: nowrap;
  }
  .source-line { font-size: 13px; margin-bottom: 4px; }
  .source-line a { color: #2464b4; }
  .empty-state { padding: 40px; text-align: center; color: var(--muted); }
</style>
</head>
<body>
  <h1>資料驗證待辦清單</h1>
  <div class="generated-at">由 scripts/check-verification.js 自動產生・產生時間：${new Date().toISOString()}</div>

  <div class="summary">
    <div class="summary-card"><div class="num">${totalItems}</div><div class="label">總筆數</div></div>
    <div class="summary-card"><div class="num">${doneItems}</div><div class="label">已完成驗證</div></div>
    <div class="summary-card"><div class="num">${todoItems}</div><div class="label">仍有待查證</div></div>
  </div>

  <div class="filters" id="filters">
      ${filterButtons}
  </div>

  ${
    rows.length === 0
      ? '<div class="empty-state">目前沒有待查證的食材，太棒了！</div>'
      : `<table id="todo-table">
    <thead>
      <tr>
        <th data-key="category">分類<span class="arrow"></span></th>
        <th data-key="name">食材<span class="arrow"></span></th>
        <th data-key="fields">待查證欄位<span class="arrow"></span></th>
        <th>建議查證來源</th>
      </tr>
    </thead>
    <tbody id="todo-tbody">
${tableRows}
    </tbody>
  </table>`
  }

<script>
  (function () {
    var buttons = document.querySelectorAll('.filter-btn');
    var rows = document.querySelectorAll('#todo-tbody tr');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        rows.forEach(function (row) {
          var show = !filter || row.getAttribute('data-category') === filter;
          row.style.display = show ? '' : 'none';
        });
      });
    });

    var sortState = {};
    document.querySelectorAll('#todo-table th[data-key]').forEach(function (th) {
      th.addEventListener('click', function () {
        var key = th.getAttribute('data-key');
        var asc = !sortState[key];
        sortState = {};
        sortState[key] = asc;

        var tbody = document.getElementById('todo-tbody');
        var rowsArr = Array.prototype.slice.call(tbody.querySelectorAll('tr'));

        rowsArr.sort(function (a, b) {
          var av, bv;
          if (key === 'fields') {
            av = a.getAttribute('data-fields') || '';
            bv = b.getAttribute('data-fields') || '';
          } else if (key === 'category') {
            av = a.getAttribute('data-category') || '';
            bv = b.getAttribute('data-category') || '';
          } else {
            av = a.children[1].textContent;
            bv = b.children[1].textContent;
          }
          return asc ? av.localeCompare(bv, 'zh-Hant') : bv.localeCompare(av, 'zh-Hant');
        });

        rowsArr.forEach(function (row) { tbody.appendChild(row); });

        document.querySelectorAll('#todo-table th .arrow').forEach(function (a) { a.textContent = ''; });
        th.querySelector('.arrow').textContent = asc ? '▲' : '▼';
      });
    });
  })();
</script>
</body>
</html>
`;
}

function main() {
  const result = scanData();

  buildMarkdown(result);
  fs.writeFileSync(HTML_OUTPUT_FILE, buildHtml(result));

  console.log(`已產生 ${path.relative(process.cwd(), MD_OUTPUT_FILE)}`);
  console.log(`已產生 ${path.relative(process.cwd(), HTML_OUTPUT_FILE)}`);
  console.log(`共 ${result.totalItems} 筆食材，${result.doneItems} 筆已完成驗證，${result.rows.length} 筆仍有待查證欄位。`);
}

main();
