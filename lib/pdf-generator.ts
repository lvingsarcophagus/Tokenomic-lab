/**
 * PDF Generator for Risk Reports
 * Generates professional PDF reports from token analysis data
 */

export interface PDFReportData {
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  chain: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  price: number
  marketCap: string
  confidence: number
  analyzedAt: string
  factors: {
    [key: string]: number
  }
  criticalFlags: string[]
  redFlags: string[]
  positiveSignals: string[]
  aiSummary?: any
}

/**
 * Generate a PDF report from token analysis data
 * Uses browser's print functionality for PDF generation
 */
export async function generatePDFReport(data: PDFReportData): Promise<void> {
  // Create a new window for the PDF content
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups for this site.')
  }

  // Generate HTML content for the PDF
  const htmlContent = generatePDFHTML(data)
  
  // Write content to the new window
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // Close window after printing (user can cancel)
      setTimeout(() => {
        printWindow.close()
      }, 100)
    }, 250)
  }
}

/**
 * Generate HTML content for PDF
 */
function generatePDFHTML(data: PDFReportData): string {
  const riskColor = 
    data.riskScore < 30 ? '#10b981' :
    data.riskScore < 60 ? '#fbbf24' :
    data.riskScore < 80 ? '#f97316' : '#ef4444'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Risk Report - ${data.tokenSymbol}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      background: white;
      color: black;
      padding: 40px;
      line-height: 1.6;
    }
    
    .header {
      border-bottom: 3px solid black;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
      letter-spacing: 2px;
    }
    
    .header .subtitle {
      font-size: 12px;
      color: #666;
      letter-spacing: 1px;
    }
    
    .token-info {
      background: #f5f5f5;
      border: 2px solid black;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .token-info h2 {
      font-size: 24px;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    
    .token-info .meta {
      font-size: 11px;
      color: #666;
      margin-bottom: 15px;
    }
    
    .risk-score {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }
    
    .risk-score .score {
      font-size: 48px;
      font-weight: bold;
      color: ${riskColor};
    }
    
    .risk-score .label {
      font-size: 14px;
      font-weight: bold;
      color: ${riskColor};
      letter-spacing: 2px;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section h3 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      letter-spacing: 1px;
      border-bottom: 2px solid black;
      padding-bottom: 5px;
    }
    
    .factors-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .factor-card {
      border: 1px solid #ddd;
      padding: 12px;
      background: #fafafa;
    }
    
    .factor-card .name {
      font-size: 10px;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .factor-card .value {
      font-size: 20px;
      font-weight: bold;
    }
    
    .factor-card .bar {
      height: 4px;
      background: #e5e5e5;
      margin-top: 8px;
      position: relative;
    }
    
    .factor-card .bar-fill {
      height: 100%;
      background: ${riskColor};
    }
    
    .flags {
      margin-bottom: 15px;
    }
    
    .flag-item {
      padding: 8px 12px;
      margin-bottom: 8px;
      border-left: 3px solid;
      background: #f9f9f9;
      font-size: 11px;
    }
    
    .flag-critical {
      border-color: #ef4444;
      background: #fee;
    }
    
    .flag-warning {
      border-color: #fbbf24;
      background: #fffbeb;
    }
    
    .flag-positive {
      border-color: #10b981;
      background: #f0fdf4;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid black;
      font-size: 10px;
      color: #666;
      text-align: center;
    }
    
    .footer .logo {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>TOKENOMICS LAB</h1>
    <div class="subtitle">RISK ANALYSIS REPORT</div>
  </div>
  
  <div class="token-info">
    <h2>${data.tokenSymbol}</h2>
    <div class="meta">
      ${data.tokenName} • ${data.chain}<br>
      ${data.tokenAddress}<br>
      Generated: ${data.analyzedAt}
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
      <div>
        <div style="font-size: 10px; color: #666; margin-bottom: 3px;">PRICE</div>
        <div style="font-size: 14px; font-weight: bold;">$${data.price.toFixed(data.price >= 1 ? 2 : 6)}</div>
      </div>
      <div>
        <div style="font-size: 10px; color: #666; margin-bottom: 3px;">MARKET CAP</div>
        <div style="font-size: 14px; font-weight: bold;">${data.marketCap}</div>
      </div>
      <div>
        <div style="font-size: 10px; color: #666; margin-bottom: 3px;">CONFIDENCE</div>
        <div style="font-size: 14px; font-weight: bold;">${data.confidence}%</div>
      </div>
    </div>
    
    <div class="risk-score">
      <div class="score">${data.riskScore}</div>
      <div>
        <div style="font-size: 11px; color: #666; margin-bottom: 3px;">RISK SCORE</div>
        <div class="label">${data.riskLevel} RISK</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h3>RISK FACTORS (10-POINT ANALYSIS)</h3>
    <div class="factors-grid">
      ${Object.entries(data.factors).map(([key, value]) => `
        <div class="factor-card">
          <div class="name">${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
          <div class="value">${value}/100</div>
          <div class="bar">
            <div class="bar-fill" style="width: ${value}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  
  ${data.criticalFlags.length > 0 ? `
  <div class="section">
    <h3>CRITICAL FLAGS</h3>
    <div class="flags">
      ${data.criticalFlags.map(flag => `
        <div class="flag-item flag-critical">${flag}</div>
      `).join('')}
    </div>
  </div>
  ` : ''}
  
  ${data.redFlags.length > 0 ? `
  <div class="section">
    <h3>WARNING FLAGS</h3>
    <div class="flags">
      ${data.redFlags.map(flag => `
        <div class="flag-item flag-warning">${flag}</div>
      `).join('')}
    </div>
  </div>
  ` : ''}
  
  ${data.positiveSignals.length > 0 ? `
  <div class="section">
    <h3>POSITIVE SIGNALS</h3>
    <div class="flags">
      ${data.positiveSignals.map(signal => `
        <div class="flag-item flag-positive">${signal}</div>
      `).join('')}
    </div>
  </div>
  ` : ''}
  
  ${data.aiSummary?.overview ? `
  <div class="section">
    <h3>AI ANALYSIS SUMMARY</h3>
    <div style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; font-size: 11px; line-height: 1.8;">
      ${data.aiSummary.overview}
    </div>
  </div>
  ` : ''}
  
  <div class="footer">
    <div class="logo">TOKENOMICS LAB</div>
    <div>Multi-Chain Token Risk Analysis Platform</div>
    <div style="margin-top: 10px;">
      This report is for informational purposes only and does not constitute financial advice.<br>
      Always conduct your own research before making investment decisions.
    </div>
  </div>
</body>
</html>
  `
}
