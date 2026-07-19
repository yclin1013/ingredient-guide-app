#!/bin/bash
cd "$(dirname "$0")"

echo "請輸入這次更新的說明文字（直接按 Enter 使用預設訊息）："
read -r MESSAGE
if [ -z "$MESSAGE" ]; then
  MESSAGE="更新於 $(date '+%Y-%m-%d %H:%M')"
fi

echo ""
echo "=================================================="
echo "1/3　Git commit 並推送到 GitHub"
echo "=================================================="
if [ -z "$(git status --porcelain)" ]; then
  echo "沒有偵測到異動，略過 commit"
else
  git add -A
  git commit -m "$MESSAGE"
fi
git -c http.version=HTTP/1.1 -c http.postBuffer=524288000 push -u origin main
if [ $? -ne 0 ]; then
  echo "❌ 推送到 GitHub 失敗，已中止後續步驟"
  read -n 1 -s -r -p $'\n按任意鍵關閉這個視窗...'
  exit 1
fi
echo "✅ GitHub 同步完成"

echo ""
echo "=================================================="
echo "2/3　發布 EAS Update（Expo Go 最新版本）"
echo "=================================================="
cd mobile
npx eas-cli update --branch production --message "$MESSAGE" --non-interactive
if [ $? -ne 0 ]; then
  echo "❌ EAS Update 發布失敗，已中止後續步驟"
  read -n 1 -s -r -p $'\n按任意鍵關閉這個視窗...'
  exit 1
fi
echo "✅ EAS Update 發布完成"

echo ""
echo "=================================================="
echo "3/3　輸出網頁版並部署到 Firebase Hosting"
echo "=================================================="
npx expo export --platform web
cp dist/+not-found.html dist/404.html
npx firebase deploy --only hosting
if [ $? -ne 0 ]; then
  echo "❌ Firebase Hosting 部署失敗"
  read -n 1 -s -r -p $'\n按任意鍵關閉這個視窗...'
  exit 1
fi
echo "✅ Firebase Hosting 部署完成"

echo ""
echo "=================================================="
echo "🎉 三邊同步完成！"
echo "=================================================="
echo "GitHub：https://github.com/yclin1013/ingredient-guide-app"
echo "Expo Go：掃描先前提供的 QR code，重新整理即可看到最新內容"
echo "網頁版：https://ingredient-guide-app.web.app"
read -n 1 -s -r -p $'\n按任意鍵關閉這個視窗...'
