#!/bin/bash
cd "$(dirname "$0")"
node scripts/check-verification.js
open -a "Google Chrome" docs/verification-todo.html 2>/dev/null || open docs/verification-todo.html
read -n 1 -s -r -p $'\n按任意鍵關閉這個視窗...'
