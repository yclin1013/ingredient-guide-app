#!/bin/bash
cd "$(dirname "$0")"
echo "即將推送到 https://github.com/yclin1013/ingredient-guide-app"
echo "系統會要求輸入 GitHub 帳號與密碼："
echo "  Username：你的 GitHub 帳號"
echo "  Password：貼上 Personal Access Token（不是登入密碼）"
echo ""
git -c http.version=HTTP/1.1 push -u origin main
read -n 1 -s -r -p $'\n推送完成後，按任意鍵關閉這個視窗...'
