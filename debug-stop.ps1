Write-Host "[debug] Restoring Worker FRONTEND_URL to production..."
cmd /c "echo https://lastagous.com/discard| wrangler secret put FRONTEND_URL --name discard-worker"

Write-Host "[debug] Done. Production settings restored."
