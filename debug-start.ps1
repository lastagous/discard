# Worker の FRONTEND_URL をローカルに切り替えてからフロントエンドを起動する

Write-Host "[debug] Worker FRONTEND_URL -> localhost に切り替え中..."
"http://localhost:4321/discARd" | wrangler secret put FRONTEND_URL --name discard-worker

Write-Host "[debug] http://localhost:4321 でフロントエンドを起動します"
Write-Host "[debug] 終了後は .\debug-stop.ps1 を実行して本番設定を戻してください"
npm run dev
