# Example Runs — EquityLens AI

This file contains example test runs for EquityLens AI. These examples can be used during project review to demonstrate the single-company research workflow, comparison workflow, scoring model, metadata transparency, and export functionality.

---

## 1. How to Run the App Locally

Start the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

Recommended test order:

```text
1. Open Home page
2. Test theme toggle
3. Test Research tab
4. Test Compare tab
5. Test History tab
6. Test export buttons
7. Test API endpoints directly
```

---

## 2. Health Check Example

### Endpoint

```http
GET /api/health
```

### Browser URL

```text
http://localhost:3000/api/health
```

### Expected Output Type

```json
{
  "success": true,
  "status": "ok",
  "service": "EquityLens AI Investment Research Agent",
  "version": "1.0.0",
  "services": {
    "alphaVantage": {
      "configured": true,
      "purpose": "Company overview, fundamentals, valuation metrics"
    },
    "finnhub": {
      "configured": false,
      "purpose": "Company news and market sentiment"
    },
    "gemini": {
      "configured": true,
      "model": "gemini-2.5-flash",
      "purpose": "Investment memo and comparison reasoning"
    }
  },
  "warnings": [
    "FINNHUB_API_KEY is missing. News will use mock fallback data."
  ],
  "endpoints": {
    "research": "POST /api/research",
    "compare": "POST /api/compare",
    "health": "GET /api/health"
  }
}
```

### What This Demonstrates

```text
- Backend is running
- API service status is visible
- Alpha Vantage configuration is checked
- Gemini configuration is checked
- Finnhub fallback behavior is transparent
```

---

## 3. Single Company Research Example — Apple

### UI Steps

```text
1. Open the Research tab
2. Enter Apple
3. Click Run Research
```

### API Request

```http
POST /api/research
Content-Type: application/json
```

```json
{
  "company": "Apple"
}
```

### Expected Output Type

```json
{
  "success": true,
  "data": {
    "company": {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "industry": "Consumer Electronics"
    },
    "decision": "WATCHLIST",
    "confidence": 70,
    "score": {
      "growth": 45,
      "profitability": 80,
      "balanceSheet": 55,
      "valuation": 40,
      "sentiment": 70,
      "total": 60
    },
    "thesis": "Apple remains a high-quality business with strong profitability, but valuation and growth tradeoffs may reduce immediate conviction.",
    "bullCase": [],
    "bearCase": [],
    "risks": [],
    "whatWouldChangeDecision": [],
    "metadata": {
      "financialDataSource": "ALPHA_VANTAGE",
      "newsDataSource": "MOCK",
      "memoProvider": "GEMINI",
      "warnings": [],
      "trace": []
    }
  }
}
```

### Expected UI Result

```text
- Company hero card appears
- Decision badge appears
- Total score appears
- Investment thesis appears
- Bull case and bear case appear
- Score breakdown appears
- Financial snapshot appears
- News and sentiment appear
- Agent trace appears
- Export memo button appears
```

### What This Demonstrates

```text
- Single-company workflow works
- Company resolver works
- Financial data service works
- Scoring engine works
- Gemini memo generation works
- Metadata and warnings are visible
```

---

## 4. Single Company Research Example — Microsoft

### UI Steps

```text
1. Open the Research tab
2. Enter Microsoft
3. Click Run Research
```

### API Request

```json
{
  "company": "Microsoft"
}
```

### Expected Output Type

```text
Decision: WATCHLIST
Score: Usually around 55–70 depending on live financial data
Reason: Strong profitability and business quality, but valuation discipline still matters.
```

### What This Demonstrates

```text
- Common company name resolution
- Real financial-data mapping
- Gemini-generated thesis
- Watchlist decision path
```

---

## 5. Single Company Research Example — Nvidia

### UI Steps

```text
1. Open the Research tab
2. Enter Nvidia
3. Click Run Research
```

### API Request

```json
{
  "company": "Nvidia"
}
```

### Expected Output Type

```text
Decision: INVEST
Score: Often high because of strong growth and profitability signals
Reason: AI infrastructure demand, strong margins, and market leadership support a stronger investment score.
```

### What This Demonstrates

```text
- Strong investment-case output
- High score path
- INVEST decision threshold
- Professional report layout
```

---

## 6. Company Comparison Example — Nvidia vs Tesla vs Netflix

### UI Steps

```text
1. Open the Compare tab
2. Enter Nvidia, Tesla, Netflix
3. Click Compare
```

### API Request

```http
POST /api/compare
Content-Type: application/json
```

```json
{
  "companies": ["Nvidia", "Tesla", "Netflix"]
}
```

### Expected Output Type

```json
{
  "success": true,
  "data": {
    "comparison": {
      "winnerSymbol": "NVDA",
      "winnerName": "NVIDIA Corporation",
      "winnerScore": 88,
      "winnerDecision": "INVEST",
      "summary": "Nvidia ranks strongest because of superior growth, profitability, and AI infrastructure positioning.",
      "ranking": [
        {
          "rank": 1,
          "symbol": "NVDA",
          "name": "NVIDIA Corporation",
          "reason": "Strongest growth and profitability profile."
        },
        {
          "rank": 2,
          "symbol": "NFLX",
          "name": "Netflix Inc.",
          "reason": "Good profitability but less compelling growth-adjusted upside."
        },
        {
          "rank": 3,
          "symbol": "TSLA",
          "name": "Tesla Inc.",
          "reason": "Higher uncertainty and weaker score compared with Nvidia."
        }
      ],
      "keyTradeoffs": []
    },
    "metadata": {
      "comparisonProvider": "GEMINI",
      "warnings": [],
      "dataQuality": {
        "financialSources": ["ALPHA_VANTAGE"],
        "newsSources": ["MOCK"],
        "memoProviders": ["GEMINI"],
        "hasMockNews": true,
        "hasMockFinancials": false,
        "hasFallbackMemo": false
      }
    }
  }
}
```

### Expected UI Result

```text
- Winner card appears
- Nvidia appears as winner
- Winner score appears
- Comparison summary appears
- Company score cards appear
- Ranking reasoning appears
- Key tradeoffs appear
- Data quality panel appears
- Export comparison button appears
```

### What This Demonstrates

```text
- Multi-company comparison workflow
- Repeated research workflow execution
- Deterministic winner selection
- AI-generated comparison reasoning
- Data-quality rollup
```

---

## 7. Company Comparison Example — Apple vs Microsoft vs Amazon

### UI Steps

```text
1. Open the Compare tab
2. Enter Apple, Microsoft, Amazon
3. Click Compare
```

### API Request

```json
{
  "companies": ["Apple", "Microsoft", "Amazon"]
}
```

### Expected Output Type

```text
Winner: Usually Microsoft or another highest-scoring company depending on live data
Decision: Usually WATCHLIST
Reason: Big-tech comparison shows quality, valuation, profitability, and growth tradeoffs.
```

### What This Demonstrates

```text
- Comparison between large-cap technology companies
- Ranking reasoning
- Watchlist-style output
- Score differences between similar companies
```

---

## 8. Export Test — Single Company Memo

### UI Steps

```text
1. Run Apple or Nvidia research
2. Click Export Memo
```

### Expected Output

A Markdown file downloads, for example:

```text
AAPL-investment-memo.md
```

or:

```text
NVDA-investment-memo.md
```

### File Should Include

```text
- Company name
- Symbol
- Decision
- Score
- Confidence
- Thesis
- Bull case
- Bear case
- Risks
- What would change the decision
- Financial snapshot
- Data-quality warnings
- Disclaimer
```

---

## 9. Export Test — Comparison Memo

### UI Steps

```text
1. Run Nvidia, Tesla, Netflix comparison
2. Click Export Comparison
```

### Expected Output

A Markdown file downloads, for example:

```text
nvda-comparison-memo.md
```

### File Should Include

```text
- Winner
- Winner score
- Winner decision
- Executive summary
- Ranking
- Key tradeoffs
- Company score table
- Data quality
- Warnings
- Disclaimer
```

---

## 10. History Test

### UI Steps

```text
1. Run one company research
2. Run one comparison
3. Open the History tab
```

### Expected Result

```text
- Saved research report appears
- Saved comparison appears
- Score appears
- Decision appears
- Created time appears
- Clicking saved item reopens the output
- Clear History removes saved items
```

### What This Demonstrates

```text
- localStorage history feature
- Saved report reopening
- Product-like user experience
- No database dependency for demo
```

---

## 11. Theme Toggle Test

### UI Steps

```text
1. Click the theme button in the floating navbar
2. Switch between dark and light mode
3. Refresh the page
```

### Expected Result

```text
- Theme changes immediately
- Theme preference persists after refresh
- Theme flicker is reduced by the theme init script
```

---

## 12. Command Palette Test

### UI Steps

```text
1. Press Ctrl + K
2. Search for Nvidia
3. Select Prefill Nvidia Research
4. Press Ctrl + K again
5. Search for Compare
6. Select comparison demo
```

### Expected Result

```text
- Command palette opens
- User can navigate tabs
- User can prefill demo examples
- User can toggle theme
```

### What This Demonstrates

```text
- Professional SaaS UX
- Keyboard-driven navigation
- Reviewer-friendly demo shortcuts
```

---

## 13. 404 Page Test

### Browser URL

```text
http://localhost:3000/random-page
```

### Expected Result

```text
Custom 404 page appears with EquityLens AI styling.
```

---

## 14. Build Test

Run:

```bash
npm run build
```

Expected result:

```text
Build completed successfully.
```

If there are TypeScript or lint errors, fix them before submission.

---

## 15. Recommended Final Demo Flow

Use this order during project review:

```text
1. Open Home page
2. Show SaaS landing page and product sections
3. Toggle theme
4. Press Ctrl + K and show command palette
5. Open Research tab
6. Run Nvidia research
7. Show score, thesis, risks, metadata, and export
8. Open Compare tab
9. Run Nvidia, Tesla, Netflix comparison
10. Show winner, ranking, score cards, and data quality
11. Export comparison memo
12. Open History tab
13. Reopen saved report
14. Open /api/health to show provider readiness
```

---

## 16. Notes About Live Data

The exact score may change depending on live provider data.

Possible reasons:

```text
- Alpha Vantage data updates
- API rate limits
- Missing financial fields
- Finnhub API key missing
- Gemini output variation
```

The app handles these cases by:

```text
- Showing warnings
- Showing data sources
- Using safe fallbacks
- Treating missing fields as unknown
- Keeping score calculation deterministic
```

---

## 17. Disclaimer

These examples are for testing and demonstration only. EquityLens AI does not provide financial advice. All investment-related outputs should be independently verified.
