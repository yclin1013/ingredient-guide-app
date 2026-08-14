# CLAUDE.md — 食材圖鑑 App

> 本檔案放在此專案資料夾根目錄,Claude Code 每次開啟都會自動讀取。
> 專案背景、目標使用者、資訊架構 → 見 `docs/PROJECT_OVERVIEW.md`
> 食材資料欄位、品種處理邏輯、資料來源、資料驗證分級規則 → 見 `docs/DATA_SCHEMA.md`
> MVP 範圍與開發階段規劃 → 見 `docs/ROADMAP.md`
> 批次新增食材資料的完整流程(品項挑選、避免重複、驗證查證、海鮮名稱對應解析)→ 見 `docs/CONTENT_WORKFLOW.md`
> 根目錄所有雙擊執行的 `.command` 檔案說明(用途、使用時機、前置設定)→ 見 `docs/COMMANDS.md`

## 這是什麼專案

台灣常見蔬菜、水果、海鮮、肉品的圖鑑型 App，協助使用者在傳統市場快速了解當季食材與挑選重點。個人興趣專案，同時作為作品集使用，未來視情況評估商業化。

## 常用指令

所有指令與雙擊執行的 `.command` 檔案說明，完整列在 `docs/COMMANDS.md`。

## 一定要遵守的規則(已定案,不要重新討論)

> 最後確認日期:2026-08-14

1. 拍照品質判斷功能尚未排入本階段開發，先不要主動實作，除非另有指示
2. 肉品類的「產季」與「挑選技巧」欄位刻意保持彈性；具體處理規則已在 `docs/CONTENT_WORKFLOW.md` 定案（產季直接標「全年供應」免驗證、挑選技巧套用通用原則），不要另外硬套統一欄位
3. **`mobile/` 的 Expo SDK 版本刻意鎖定在 54，不要主動升級**：使用者手機的 Expo Go 只支援到 SDK 54，曾因專案版本領先手機版本導致無法預覽，詳見 `mobile/AGENTS.md`
4. 每筆食材資料都有 `verification`（official／secondary／unverified 三級）欄位，記錄 nutrition／selectionTips／months 各自的查證狀態；新增或修改食材資料一律依 `docs/CONTENT_WORKFLOW.md` 的流程與驗證規則執行，不要憑印象填數據
5. 想知道目前還有哪些食材資料待查證，執行 `scripts/check-verification.js`（或雙擊根目錄的 `check-verification.command`）產生 `docs/VERIFICATION_TODO.md` 與 `docs/verification-todo.html`
6. 根目錄的 `start-app.command` 可雙擊啟動 Expo 開發伺服器，不需要另外打開終端機

## 資料結構重點

食材資料欄位、品種處理邏輯、資料來源、資料驗證分級規則，完整定義在 `docs/DATA_SCHEMA.md`。

## 目前進度與待辦

資訊架構與資料結構已在雛形中驗證過，正式 App 專案已建立於 `mobile/`（React Native / Expo）。目前主力工作是依 `docs/CONTENT_WORKFLOW.md` 的流程持續擴充四大分類（蔬菜、水果、海鮮、肉品）的食材資料。

## 協作方式

與本專案協作前，請先閱讀 `docs/COLLABORATION_GUIDE.md`，並依其中的工作原則與溝通風格進行。

---

以下為本專案額外累積的補充章節,不屬於共通骨架,只在本專案適用:

## 已驗證的雛形（UI/UX 與互動邏輯參考）

- `prototypes/ingredient-app-prototype.jsx`：主要 App 流程雛形
- `prototypes/photo-quality-demo.jsx`：拍照品質判斷可行性 demo
