#!/bin/bash
cd "$(dirname "$0")"
node scripts/check-web-links.js
open -a "Google Chrome" docs/WEB_LINKS_CHECK.md 2>/dev/null || open docs/WEB_LINKS_CHECK.md
read -n 1 -s -r -p $'\n按任意鍵關閉這個視窗...'
