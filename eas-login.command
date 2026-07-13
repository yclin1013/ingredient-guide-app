#!/bin/bash
cd "$(dirname "$0")/mobile"
npx eas-cli login
read -n 1 -s -r -p $'\n登入完成後，按任意鍵關閉這個視窗...'
