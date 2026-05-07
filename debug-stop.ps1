# Worker の FRONTEND_URL を本番に戻す

Write-Host "[debug] Worker FRONTEND_URL -> 本番に戻し中..."
"https://lastagous.com/discARd" | wrangler secret put FRONTEND_URL --name discard-worker

Write-Host "[debug] 完了。本番設定に戻りました。"
