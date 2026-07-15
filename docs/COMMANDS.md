# 雙擊指令檔（.command）說明

> 根目錄下所有 `.command` 檔案都是雙擊即可執行的腳本，會開一個終端機視窗跑指令。
> 全部都是獨立的 shell 腳本，**不需要事先開著 Claude Code**，關掉 Claude Code 之後一樣能雙擊執行。
> 每次新增 `.command` 檔案時，這份文件要同步更新（見 `COLLABORATION_GUIDE.md`）。

## start-app.command

- **用途**：啟動本機的 Expo 開發伺服器，供手機／模擬器連線預覽最新程式碼
- **使用時機**：正在開發、想即時預覽修改結果時（例如調整畫面樣式，想馬上看到變化）
- **是否需要網路**：需要區域網路——手機要跟這台電腦連在同一個 Wi-Fi 才能連線，不一定需要能連外網
- **是否需要 Claude Code**：不需要，獨立雙擊執行；但**電腦要保持開著、視窗不能關**，關掉視窗或睡眠就會斷線
- **前置設定**：手機要先安裝 Expo Go App（SDK 54 版本，太新的 Expo Go 會無法連線，見 `mobile/AGENTS.md`）

## check-verification.command

- **用途**：掃描四個分類的食材資料檔，列出哪些欄位（營養／挑選技巧／產季）還沒查證，產生報告並自動開啟
- **使用時機**：新增或修改食材資料後，想知道還有哪些欄位需要人工查證時
- **是否需要網路**：不需要，純掃描本機的 JSON 資料檔
- **是否需要 Claude Code**：不需要，獨立雙擊執行
- **前置設定**：無

## check-web-links.command

- **用途**：用無頭瀏覽器實際打開網頁版的每一個食材／分類頁面，檢查畫面內容是否正確顯示（不是只看 HTTP 狀態碼），產生報告並自動開啟
- **使用時機**：部署網頁版之後，想確認每個連結點進去畫面內容都正確、沒有「找不到資料」或分類跑掉的情況
- **是否需要網路**：需要，會連到 `https://ingredient-guide-app.web.app` 逐頁檢查
- **是否需要 Claude Code**：不需要，獨立雙擊執行
- **前置設定**：根目錄需要先執行過 `npm install`（puppeteer 套件與內建 Chromium，目前已裝好）；檢查的是「目前線上版本」，所以最好在 `deploy-web.command` 或 `publish-all.command` 之後再執行才有意義

## eas-login.command

- **用途**：登入 Expo／EAS 帳號（給 `publish-update.command`、`publish-all.command` 等指令使用）
- **使用時機**：第一次設定這台電腦，或是 EAS 登入狀態過期、指令出現「未登入」錯誤時
- **是否需要網路**：需要
- **是否需要 Claude Code**：不需要，獨立雙擊執行
- **前置設定**：需要先在 [expo.dev](https://expo.dev/signup) 註冊過帳號（目前使用帳號 `yclin1013`）

## publish-update.command

- **用途**：只發布新的 EAS Update，讓手機上的 Expo Go App 抓到最新內容
- **使用時機**：只想更新「手機 Expo Go 預覽版本」，不想同時動到 GitHub 或網頁版時
- **是否需要網路**：需要
- **是否需要 Claude Code**：不需要，獨立雙擊執行
- **前置設定**：需要先用 `eas-login.command` 登入過 EAS 帳號

## deploy-web.command

- **用途**：重新輸出網頁版建置檔，部署到 Firebase Hosting
- **使用時機**：只想更新「網頁版」（分享給別人用瀏覽器看的那個），不想同時動到 GitHub 或手機版時
- **是否需要網路**：需要，會上傳建置檔到 Firebase
- **是否需要 Claude Code**：不需要，獨立雙擊執行
- **前置設定**：需要先登入過 Firebase CLI（`npx firebase login`，目前使用帳號 `dannylin1013@gmail.com`），且專案已連結到 Firebase Hosting 專案 `ingredient-guide-app`（`mobile/firebase.json`、`mobile/.firebaserc` 已設定好）

## push-to-github.command

- **用途**：把本機的 git commit 推送到 GitHub
- **使用時機**：只想同步「原始碼版本」到 GitHub，不想同時發布 EAS Update 或網頁版時
- **是否需要網路**：需要
- **是否需要 Claude Code**：不需要，獨立雙擊執行
- **前置設定**：需要 git remote 已設定好指向 [github.com/yclin1013/ingredient-guide-app](https://github.com/yclin1013/ingredient-guide-app)；第一次執行會要求輸入 GitHub 帳號與 Personal Access Token（不是登入密碼），成功一次後 macOS 鑰匙圈會記住，之後不用重複輸入

## publish-all.command

- **用途**：一鍵完成三邊同步——依序執行「commit 並推送 GitHub」「發布 EAS Update」「輸出網頁版並部署 Firebase」，等於 `push-to-github.command` + `publish-update.command` + `deploy-web.command` 三合一
- **使用時機**：新增食材資料、調整畫面、或任何修改之後，想要讓 GitHub、手機版、網頁版**同時**更新到最新內容時（這是日常最常用的指令）
- **是否需要網路**：需要，三個步驟都要連網
- **是否需要 Claude Code**：不需要，獨立雙擊執行
- **前置設定**：等於上面三個指令的前置設定總和——git remote＋GitHub PAT、EAS 登入、Firebase 登入，三個都要先設定好。任一步驟失敗會中止並停在該步，方便知道卡在哪裡，不會顯示「成功」卻其實沒發布完整
