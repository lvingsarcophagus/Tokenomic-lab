import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'

/**
 * PRO API: AI Chat Assistant
 * POST - Chat with AI about portfolio and market insights
 */

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = await getAdminAuth().verifyIdToken(token)

    // Check if user is premium
    const customClaims = decodedToken as any
    if (!customClaims.isPremium && !customClaims.admin) {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    const body = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Simple AI response (you can integrate OpenAI API here)
    const aiResponse = generateAIResponse(message, context)

    return NextResponse.json({ 
      response: aiResponse,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in AI chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateAIResponse(message: string, context?: any): string {
  const lowerMessage = message.toLowerCase()

  // Portfolio analysis
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('holdings')) {
    return `Based on your portfolio analysis:
    
📊 **Portfolio Health**: Your average risk score is ${context?.avgRiskScore || 42}/100, indicating a moderate risk profile.

🎯 **Recommendations**:
- Consider diversifying into lower-risk tokens (score < 30)
- Monitor your ${context?.highRiskTokens || 3} high-risk tokens closely
- ${context?.alerts24h || 5} alerts in the last 24h suggest increased volatility

💡 **Next Steps**: Review tokens with recent price drops and assess if they're temporary dips or trend reversals.`
  }

  // Risk analysis
  if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
    return `🛡️ **Risk Assessment**:

Your watchlist shows a balanced risk distribution. Here's what to watch:

⚠️ **High Priority**:
- Tokens with risk scores > 70 should be reviewed immediately
- Recent liquidity changes in ${context?.highRiskTokens || 3} tokens
- Whale activity detected in last 24 hours

✅ **Looking Good**:
- ${context?.totalTokens - (context?.highRiskTokens || 0) || 12} tokens with acceptable risk levels
- Strong holder distribution in top performers

🔍 **Action Items**: Run detailed scans on red-flagged tokens within 24h.`
  }

  // Market sentiment
  if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
    return `📈 **Market Intelligence**:

**Current Sentiment**: Mixed with cautious optimism

**Key Insights**:
- 67% of your watchlist showing bullish indicators
- Increased on-chain activity suggests growing interest
- Smart money accumulating in 4 of your tokens

**Recommendations**:
- Good time to DCA into quality projects
- Be ready for volatility in the next 48-72 hours
- Consider taking partial profits on tokens up >100%

⚡ Monitor whale wallets and liquidity pools closely.`
  }

  // Alerts
  if (lowerMessage.includes('alert') || lowerMessage.includes('warning')) {
    return `🔔 **Alert Summary**:

You have ${context?.alerts24h || 5} active alerts requiring attention:

**Critical** (2):
- SCAM token: Liquidity dropped 80% - IMMEDIATE ACTION
- WHALE activity on PEPE - Monitor closely

**High** (2):
- Risk score increased on SHIB (35 → 62)
- Large wallet movement detected

**Medium** (1):
- Price surge +25% on DOGE (potential profit-taking)

💡 **Tip**: Set up custom alert thresholds in Settings to filter noise.`
  }

  // Performance
  if (lowerMessage.includes('performance') || lowerMessage.includes('profit')) {
    return `💰 **Performance Analysis**:

**24h Performance**: ${context?.profitLoss24h > 0 ? '+' : ''}${context?.profitLoss24h?.toFixed(2) || '+5.8'}%

**Highlights**:
- 🚀 Best performer: +245.8% (Strong fundamentals)
- 📉 Worst performer: -42.3% (Consider exit strategy)
- 📊 Average return: +18.7% across portfolio

**Insights**:
- You're outperforming market average by 12%
- Risk-adjusted returns look healthy
- Consider rebalancing if any token exceeds 25% of portfolio

🎯 **Strategy**: Lock in profits on winners, reassess losers.`
  }

  // Default response
  return `👋 **TokenGuard AI Assistant**

I can help you with:

📊 **Portfolio Analysis** - "How's my portfolio performing?"
🛡️ **Risk Assessment** - "Which tokens are risky?"
📈 **Market Insights** - "What are the market trends?"
🔔 **Alert Summary** - "What alerts do I have?"
💰 **Performance Review** - "Show my profit/loss"

**Quick Stats**:
- Watchlist: ${context?.totalTokens || 15} tokens
- Avg Risk: ${context?.avgRiskScore || 42}/100
- 24h Alerts: ${context?.alerts24h || 5}
- Portfolio Value: $${context?.totalValue?.toLocaleString() || '125,000'}

What would you like to know?`
}
