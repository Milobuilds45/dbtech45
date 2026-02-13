@echo off
cd /d C:\Users\derek\OneDrive\Desktop\MILO\projects\dbtech45
node scripts\sync-ops-status.js
git add public\data\ops-status.json
git diff --cached --quiet || git commit -m "chore: auto-sync ops status data" && git push
