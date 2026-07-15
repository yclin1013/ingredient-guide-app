#!/usr/bin/env node
// 用無頭瀏覽器實際打開網頁版的每個食材／分類頁面，檢查畫面上真的顯示對應名稱，
// 而不只是看 HTTP 狀態碼（SPA 對任何路徑都會回傳 200，狀態碼無法反映內容是否正確）。
// 產出 docs/WEB_LINKS_CHECK.md 報告。

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DATA_DIR = path.join(__dirname, '..', 'mobile', 'src', 'data');
const REPORT_FILE = path.join(__dirname, '..', 'docs', 'WEB_LINKS_CHECK.md');
const BASE_URL = process.argv[2] || 'https://ingredient-guide-app.web.app';
const CONCURRENCY = 5;
const NOT_FOUND_TEXT = '找不到這筆食材資料';

const CATEGORY_FILES = [
  { file: 'vegetables.json', category: '蔬菜' },
  { file: 'fruits.json', category: '水果' },
  { file: 'seafood.json', category: '海鮮' },
  { file: 'meats.json', category: '肉品' },
];

function loadItems() {
  const items = [];
  for (const { file, category } of CATEGORY_FILES) {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const item of data) {
      items.push({ id: item.id, name: item.name, category });
    }
  }
  return items;
}

function buildTargets(items) {
  const targets = [];

  for (const item of items) {
    targets.push({
      type: 'item',
      url: `${BASE_URL}/item/${encodeURIComponent(item.id)}`,
      label: `食材：${item.name}（${item.id}）`,
      expectedText: item.name,
    });
  }

  const categories = [...new Set(items.map((i) => i.category))];
  for (const category of categories) {
    const sampleItem = items.find((i) => i.category === category);
    targets.push({
      type: 'category',
      url: `${BASE_URL}/category/${encodeURIComponent(category)}`,
      label: `分類：${category}`,
      expectedText: category,
      sampleItemName: sampleItem ? sampleItem.name : null,
    });
  }

  return targets;
}

async function checkTarget(browser, target) {
  const page = await browser.newPage();
  try {
    await page.goto(target.url, { waitUntil: 'networkidle0', timeout: 30000 });
    const bodyText = await page.evaluate(() => document.body.innerText);

    if (target.type === 'item') {
      if (bodyText.includes(NOT_FOUND_TEXT)) {
        return { ...target, ok: false, reason: '顯示「找不到這筆食材資料」，資料對不上' };
      }
      if (!bodyText.includes(target.expectedText)) {
        return { ...target, ok: false, reason: `畫面上沒有出現食材名稱「${target.expectedText}」` };
      }
      return { ...target, ok: true };
    }

    // category
    if (!bodyText.includes(target.expectedText)) {
      return { ...target, ok: false, reason: `畫面上沒有出現分類名稱「${target.expectedText}」，可能是路由參數對不上、fallback 到其他分類` };
    }
    if (target.sampleItemName && !bodyText.includes(target.sampleItemName)) {
      return { ...target, ok: false, reason: `分類名稱有出現，但該分類下的品項（例如「${target.sampleItemName}」）沒有顯示` };
    }
    return { ...target, ok: true };
  } catch (err) {
    return { ...target, ok: false, reason: `頁面載入失敗：${err.message}` };
  } finally {
    await page.close();
  }
}

async function runWithConcurrency(browser, targets, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < targets.length) {
      const current = targets[index];
      index += 1;
      const result = await checkTarget(browser, current);
      results.push(result);
      const icon = result.ok ? '✅' : '❌';
      console.log(`${icon} ${result.label}`);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

function buildReport(results, generatedAt) {
  const total = results.length;
  const okCount = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  const lines = [];
  lines.push('# 網頁版內容檢查報告');
  lines.push('');
  lines.push('> 本檔案由 `scripts/check-web-links.js` 自動產生，請勿手動編輯；重新執行腳本會覆蓋內容。');
  lines.push(`> 檢查對象：${BASE_URL}`);
  lines.push(`> 產生時間：${generatedAt}`);
  lines.push('');
  lines.push(`## 總覽`);
  lines.push('');
  lines.push(`- 檢查頁面總數：${total}`);
  lines.push(`- ✅ 正常顯示：${okCount}`);
  lines.push(`- ❌ 內容有問題：${failed.length}`);
  lines.push('');

  if (failed.length > 0) {
    lines.push('## 內容有問題的頁面');
    lines.push('');
    lines.push('| 頁面 | 網址 | 問題原因 |');
    lines.push('|---|---|---|');
    for (const r of failed) {
      lines.push(`| ${r.label} | ${r.url} | ${r.reason} |`);
    }
    lines.push('');
  } else {
    lines.push('## 內容有問題的頁面');
    lines.push('');
    lines.push('沒有發現問題，所有頁面內容都正常顯示對應名稱。');
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  console.log(`開始檢查網頁版內容，目標：${BASE_URL}`);
  const items = loadItems();
  const targets = buildTargets(items);
  console.log(`共 ${targets.length} 個頁面（${items.length} 筆食材 + ${targets.length - items.length} 個分類），開始檢查...\n`);

  const browser = await puppeteer.launch();
  let results;
  try {
    results = await runWithConcurrency(browser, targets, CONCURRENCY);
  } finally {
    await browser.close();
  }

  const generatedAt = new Date().toISOString();
  const report = buildReport(results, generatedAt);
  fs.writeFileSync(REPORT_FILE, report, 'utf-8');

  const okCount = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  console.log('\n=================================================');
  console.log(`檢查完成：${results.length} 個頁面，✅ 正常 ${okCount} 個，❌ 有問題 ${failed.length} 個`);
  if (failed.length > 0) {
    console.log('\n有問題的頁面：');
    for (const r of failed) {
      console.log(`  ❌ ${r.label}`);
      console.log(`     網址：${r.url}`);
      console.log(`     原因：${r.reason}`);
    }
  }
  console.log(`\n完整報告已寫入：${path.relative(process.cwd(), REPORT_FILE)}`);
}

main().catch((err) => {
  console.error('檢查過程發生錯誤：', err);
  process.exit(1);
});
