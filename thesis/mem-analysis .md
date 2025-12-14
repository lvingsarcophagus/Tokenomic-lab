onst classificationPrompt = `
Analyze this cryptocurrency token and determine if it's a MEME token or UTILITY token.

TOKEN DATA:
- Name: ${tokenName}
- Symbol: ${tokenSymbol}
- Description: ${description || 'Not available'}
- Website: ${website || 'None'}
- Twitter: ${twitter || 'None'}
- Market Cap: $${marketCap?.toLocaleString() || 'Unknown'}
- Holder Count: ${holderCount || 'Unknown'}
- Contract Verified: ${isVerified ? 'Yes' : 'No'}

MEME TOKEN INDICATORS:
1. Name references internet memes, animals, or pop culture
2. Symbol uses playful abbreviations (DOGE, SHIB, PEPE, BONK)
3. Description emphasizes community, fun, or viral potential
4. Marketing focuses on social media presence over utility
5. No clear technical use case or ecosystem

UTILITY TOKEN INDICATORS:
1. Clear technical purpose (DeFi, Gaming, Infrastructure)
2. Professional documentation and roadmap
3. Institutional partnerships or backing
4. Verified smart contract with meaningful functionality
5. Token economics tied to platform usage

Respond in JSON format:
{
  "isMeme": boolean,
  "confidence": number (0-100),
  "reasoning": "Brief explanation"
}
`