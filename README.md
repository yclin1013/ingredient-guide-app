# 食材圖鑑 App

協助使用者在台灣傳統市場快速了解當季食材與挑選重點的圖鑑型 App。

## 線上展示

網頁版：[https://ingredient-guide-app.web.app](https://ingredient-guide-app.web.app)

## 主要功能

- 依分類（蔬菜、水果、海鮮、肉品）與產季瀏覽食材
- 食材搜尋
- 食材詳細頁：產季、挑選技巧、營養價值、保存方式
- 保存後如何判斷變質
- 需特別留意的隱性食安風險提醒
- 資料來源標示，並採三級查證分級制度（official／secondary／unverified），標示每筆資料的可信程度

## 使用的技術

- **Expo / React Native**：App 主體開發框架，同一份程式碼可輸出 iOS、Android 與網頁版
- **Firebase Hosting**：網頁版的部署與託管
- **EAS Update**：讓已安裝 Expo Go 的使用者透過固定連結即時取得最新版本，不需重新安裝

## 如何在本機執行

```bash
cd mobile
npm install
npx expo start
```

啟動後可依終端機提示，用 Expo Go App 掃描 QR code 在手機上預覽，或按 `w` 在瀏覽器開啟網頁版。

## 開發歷程

完整的開發過程記錄在 [docs/CHANGELOG.md](docs/CHANGELOG.md)。
