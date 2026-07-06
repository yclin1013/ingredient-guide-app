# 食材圖鑑 App

台灣常見蔬菜、水果、海鮮、肉品的圖鑑型 App，協助使用者在傳統市場快速了解當季食材與挑選重點。個人興趣專案，同時作為作品集使用，未來視情況評估商業化。

## 詳細規劃文件
- 專案背景、目標使用者、資訊架構：`docs/PROJECT_OVERVIEW.md`
- 食材資料欄位、品種處理邏輯、資料來源、資料驗證分級規則：`docs/DATA_SCHEMA.md`
- MVP 範圍與開發階段規劃：`docs/ROADMAP.md`
- 批次新增食材資料的完整流程（品項挑選、避免重複、驗證查證、海鮮名稱對應解析）：`docs/CONTENT_WORKFLOW.md`

## 已驗證的雛形（UI/UX 與互動邏輯參考）
- `prototypes/ingredient-app-prototype.jsx`：主要 App 流程雛形
- `prototypes/photo-quality-demo.jsx`：拍照品質判斷可行性 demo

## 目前階段
資訊架構與資料結構已在雛形中驗證過，正式 App 專案已建立於 `mobile/`（React Native / Expo）。目前主力工作是依 `docs/CONTENT_WORKFLOW.md` 的流程持續擴充四大分類（蔬菜、水果、海鮮、肉品）的食材資料。

## 注意事項
- 拍照品質判斷功能尚未排入本階段開發，先不要主動實作，除非另有指示
- 肉品類的「產季」與「挑選技巧」欄位刻意保持彈性；具體處理規則已在 `docs/CONTENT_WORKFLOW.md` 定案（產季直接標「全年供應」免驗證、挑選技巧套用通用原則），不要另外硬套統一欄位
- **`mobile/` 的 Expo SDK 版本刻意鎖定在 54，不要主動升級**：使用者手機的 Expo Go 只支援到 SDK 54，曾因專案版本領先手機版本導致無法預覽，詳見 `mobile/AGENTS.md`
- 每筆食材資料都有 `verification`（official／secondary／unverified 三級）欄位，記錄 nutrition／selectionTips／months 各自的查證狀態；新增或修改食材資料一律依 `docs/CONTENT_WORKFLOW.md` 的流程與驗證規則執行，不要憑印象填數據
- 想知道目前還有哪些食材資料待查證，執行 `scripts/check-verification.js`（或雙擊根目錄的 `check-verification.command`）產生 `docs/VERIFICATION_TODO.md` 與 `docs/verification-todo.html`
- 根目錄的 `start-app.command` 可雙擊啟動 Expo 開發伺服器，不需要另外打開終端機

## 協作方式
與本專案協作前，請先閱讀 `docs/COLLABORATION_GUIDE.md`，並依其中的工作原則與溝通風格進行。
