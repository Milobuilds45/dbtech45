@echo off
cd /d C:\Users\derek\OneDrive\Desktop\MILO\projects\dbtech45
node scripts\sync-all-data.js
git add public\data\*.json
git diff --cached --quiet || git commit -m "chore: auto-sync dashboard data" && git push
