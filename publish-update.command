#!/bin/bash
cd "$(dirname "$0")/mobile"
echo "請輸入這次更新的說明文字（直接按 Enter 使用預設訊息）："
read -r MESSAGE
if [ -z "$MESSAGE" ]; then
  MESSAGE="更新於 $(date '+%Y-%m-%d %H:%M')"
fi
npx eas-cli update --branch production --message "$MESSAGE"
read -n 1 -s -r -p $'\n發佈完成後，手機上的 Expo Go 重新整理（下拉或重新打開）就會看到最新內容。按任意鍵關閉這個視窗...'
