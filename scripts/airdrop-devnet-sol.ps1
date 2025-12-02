# Airdrop devnet SOL to your wallet
# Replace with your actual wallet address

$WALLET_ADDRESS = "UpBuwdHP6en13y8HW9en9rHAVxLNU8X4MNgKtgH4FUS"

Write-Host "🚀 Requesting devnet SOL airdrop..." -ForegroundColor Cyan
Write-Host "Wallet: $WALLET_ADDRESS" -ForegroundColor Yellow

# Request 2 SOL (devnet limit per request)
solana airdrop 2 $WALLET_ADDRESS --url devnet

Write-Host ""
Write-Host "✅ Airdrop complete! Checking balance..." -ForegroundColor Green

# Check balance
solana balance $WALLET_ADDRESS --url devnet

Write-Host ""
Write-Host "💡 If you need more SOL, run this script again or use:" -ForegroundColor Cyan
Write-Host "   https://faucet.solana.com" -ForegroundColor White
