#!/bin/bash

# Quick setup script for Developer Mode
# Usage: ./scripts/setup-dev-mode.sh

echo "🔧 Setting up Developer Mode for TokenGuard..."
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to append dev mode settings? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
    echo "" >> .env.local
    echo "# Developer Mode (added by setup script)" >> .env.local
else
    echo "# Developer Mode Configuration" > .env.local
fi

# Add dev mode settings
cat >> .env.local << 'EOF'
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_DEV_DEFAULT_PLAN=PREMIUM
NEXT_PUBLIC_DEV_BYPASS_RATE_LIMIT=true
EOF

echo "✅ Developer Mode enabled in .env.local"
echo ""
echo "📋 Current settings:"
echo "   - Dev Mode: ENABLED"
echo "   - Default Plan: PREMIUM"
echo "   - Rate Limit Bypass: ENABLED"
echo ""
echo "🎯 Next steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Look for the yellow dev panel in bottom-right"
echo "   3. Test the API: node scripts/test-api.js"
echo ""
echo "📖 For more info, see DEV_MODE.md"
echo ""
echo "🎉 Setup complete!"
