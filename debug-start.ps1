Write-Host "[debug] Switching Worker FRONTEND_URL to localhost..."
bash -c "cd worker && echo 'http://localhost:4321/discARd' | wrangler secret put FRONTEND_URL --name discard-worker"

Write-Host "[debug] Starting frontend at http://localhost:4321 ..."
Write-Host "[debug] After Ctrl+C, run .\debug-stop.ps1 to restore production settings."
npm run dev
