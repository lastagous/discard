Write-Host "[debug] Restoring Worker FRONTEND_URL to production..."
bash -c "cd worker && echo 'https://lastagous.com/discARd' | wrangler secret put FRONTEND_URL --name discard-worker"

Write-Host "[debug] Done. Production settings restored."
