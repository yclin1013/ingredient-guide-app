#!/bin/bash
cd "$(dirname "$0")/mobile"
echo "1/3 輸出網頁版建置檔..."
npx expo export --platform web
echo ""
echo "2/3 準備 404 頁面..."
cp dist/+not-found.html dist/404.html
echo ""
echo "3/3 部署到 Firebase Hosting..."
npx firebase deploy --only hosting
echo ""
echo "完成！網址：https://ingredient-guide-app.web.app"
read -n 1 -s -r -p $'\n按任意鍵關閉這個視窗...'
