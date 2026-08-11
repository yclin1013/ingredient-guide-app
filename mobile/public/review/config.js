// 這個檔案在正式部署時會被 scripts/generate-review-config.js 自動覆蓋（讀取根目錄 .env）。
// 這裡的空值只在本機開發、還沒跑過部署流程時當預設值使用，不含任何機密資料。
window.REVIEW_CONFIG = {
  syncUrl: '',
  passphrase: '',
};
