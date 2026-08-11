// 部署網頁版時執行：把根目錄 .env 裡的查證清單同步設定寫進 mobile/dist/review/config.js。
// 這個輸出檔案只存在於（不會進 git 的）dist/ 目錄，通關密語不會進到任何 git 追蹤的原始碼檔案。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const OUTPUT_PATH = path.join(ROOT, 'mobile', 'dist', 'review', 'config.js');

function parseEnv(content) {
  const result = {};
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    result[key] = value;
  });
  return result;
}

if (!fs.existsSync(ENV_PATH)) {
  console.error(`找不到 .env（預期路徑：${ENV_PATH}），略過查證清單同步設定產生。`);
  process.exit(0);
}

const env = parseEnv(fs.readFileSync(ENV_PATH, 'utf8'));
const passphrase = env.REVIEW_SYNC_PASSPHRASE || '';
const syncUrl = env.REVIEW_APPS_SCRIPT_URL || '';

if (!passphrase || !syncUrl) {
  console.warn('提醒：REVIEW_SYNC_PASSPHRASE 或 REVIEW_APPS_SCRIPT_URL 尚未在 .env 設定完整，查證清單頁面的同步功能會無法使用。');
}

const outDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outDir)) {
  console.error(`找不到 ${outDir}，請確認已先執行 expo export。`);
  process.exit(1);
}

const content = `window.REVIEW_CONFIG = ${JSON.stringify({ syncUrl, passphrase }, null, 2)};\n`;
fs.writeFileSync(OUTPUT_PATH, content, 'utf8');
console.log('已產生查證清單同步設定：mobile/dist/review/config.js');
