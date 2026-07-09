# AI Chat Logs — EquityLens AI

This file documents how AI tools were used during the development of EquityLens AI. The AI was used as a development collaborator for architecture planning, backend workflow design, frontend UI improvement, debugging, and documentation support.

---

## 1. Project Goal Prompt

```text
Build an AI Investment Research Agent that takes a company name, researches it, and decides whether to invest, pass, or watchlist with reasoning.

Use:
- React / Next.js frontend
- Node.js / Next.js backend
- LangChain.js / LangGraph.js
- Any LLM provider
- Financial APIs if required

The project should be production-style and good enough for assignment submission.
```

### AI Contribution

The AI helped convert the requirement into a structured full-stack product idea named **EquityLens AI**.

The product direction became:

```text
EquityLens AI — Investment Research Command Center
```

Core features planned:

* Single-company research
* Company comparison
* Explainable scoring
* LLM-generated memo
* Source metadata
* Fallback handling
* Exportable reports
* Professional SaaS-style UI

---

## 2. Backend Architecture Prompt

```text
Design the backend architecture for this investment research agent using Next.js API routes and LangGraph.js.

The system should:
- Resolve a company name to a stock symbol
- Fetch financial data
- Fetch news or fallback news
- Score the company
- Generate a memo using Gemini
- Return a structured JSON report
```

### AI Contribution

The AI proposed a LangGraph workflow:

```text
START
  ↓
resolveCompany
  ↓
fetchFinancials
  ↓
fetchNews
  ↓
scoreCompany
  ↓
generateDecision
  ↓
END
```

The backend was split into clear layers:

```text
src/lib/config
src/lib/types
src/lib/services
src/lib/scoring
src/lib/langgraph
src/app/api
```

---

## 3. Type System Prompt

```text
Create TypeScript types for the investment research report, company profile, financial snapshot, news item, score breakdown, metadata, and trace steps.
```

### AI Contribution

The AI helped define strongly typed structures for:

* `InvestmentResearchReport`
* `CompanyProfile`
* `FinancialSnapshot`
* `NewsItem`
* `ScoreBreakdown`
* `ResearchMetadata`
* `AgentTraceStep`

This made the backend response predictable and easier to connect to the frontend.

---

## 4. Financial Data Prompt

```text
Create an Alpha Vantage service that fetches company overview data and maps it into our internal financial snapshot format.

Also handle missing data, API errors, rate-limit messages, and invalid symbols safely.
```

### AI Contribution

The AI helped build the Alpha Vantage service for:

* Company symbol
* Company name
* Exchange
* Sector
* Industry
* Market capitalization
* Revenue growth
* Profit margin
* Operating margin
* Return on equity
* P/E ratio
* Forward P/E
* PEG ratio
* Price-to-sales ratio
* EPS
* Beta

It also helped add safe parsing and error handling.

---

## 5. Company Resolver Prompt

```text
Create a company resolver that supports common company names like Apple, Tesla, Nvidia, Microsoft, Amazon, Meta, and Netflix.

If a company is not in the local resolver, use Alpha Vantage symbol search.
```

### AI Contribution

The AI helped create a hybrid resolver:

* Local resolver for common companies
* Alpha Vantage symbol search fallback
* User input fallback when exact resolution is unavailable

This improved demo reliability while still supporting flexible company input.

---

## 6. News Data Prompt

```text
Create a news service using Finnhub company news.

If Finnhub API key is missing or the API fails, return mock fallback news and clearly show this in metadata.
```

### AI Contribution

The AI helped implement:

* Finnhub news fetcher
* News sentiment classifier
* Mock news fallback
* Metadata warning when fallback is used

This made the app stable even when the news API key is missing.

---

## 7. Scoring Model Prompt

```text
Design an explainable scoring model for investment decisions.

Score categories:
- Growth
- Profitability
- Balance Sheet
- Valuation
- Sentiment

The final decision should be INVEST, WATCHLIST, or PASS.
```

### AI Contribution

The AI helped create a deterministic scoring model:

| Category      | Weight |
| ------------- | -----: |
| Growth        |    25% |
| Profitability |    20% |
| Balance Sheet |    20% |
| Valuation     |    20% |
| Sentiment     |    15% |

Decision thresholds:

|    Score | Decision  |
| -------: | --------- |
|      75+ | INVEST    |
|    55–74 | WATCHLIST |
| Below 55 | PASS      |

Important design decision:

```text
The LLM does not decide the numeric score.
The TypeScript scoring engine calculates the score.
The LLM only explains the result.
```

---

## 8. Gemini Memo Prompt

```text
Use Gemini with LangChain.js to generate a structured investment memo.

The memo should include:
- Thesis
- Bull case
- Bear case
- Risks
- What would change the decision
```

### AI Contribution

The AI helped create a Gemini-powered memo service using structured output.

The generated memo includes:

* Investment thesis
* Bull case
* Bear case
* Key risks
* Decision-change triggers

Fallback memo generation was also added in case the Gemini API fails.

---

## 9. LangGraph Integration Prompt

```text
Connect all backend services into a LangGraph workflow.

Each node should update state and add metadata trace logs.
```

### AI Contribution

The AI helped organize LangGraph nodes:

* `resolve-company`
* `fetch-financials`
* `fetch-news`
* `score-company`
* `generate-decision`

Each node adds trace metadata such as:

* Step name
* Status
* Provider
* Message
* Timestamp

This made the agent execution inspectable.

---

## 10. API Routes Prompt

```text
Create API routes for:
- POST /api/research
- POST /api/compare
- GET /api/health
```

### AI Contribution

The AI helped implement:

### `/api/research`

Runs a single-company research workflow.

### `/api/compare`

Runs research for 2–3 companies and generates:

* Winner
* Ranking
* Key tradeoffs
* Data quality summary

### `/api/health`

Returns backend service readiness:

* Alpha Vantage configured or not
* Gemini configured or not
* Finnhub configured or not
* API warnings
* Available endpoints

---

## 11. Frontend Planning Prompt

```text
Design a professional frontend for the investment research agent.

It should look like a SaaS product, not a basic dashboard.
It should include:
- Landing page
- Floating navbar
- Home tab
- Research tab
- Compare tab
- History tab
- Theme toggle
- 3D-style product hero
```

### AI Contribution

The AI helped redesign the frontend into a SaaS-style product with:

* Floating navbar
* Theme toggle
* Animated hero visual
* Product sections
* Research workspace
* Compare workspace
* History workspace
* Command palette
* Professional loading states
* Professional result views

---

## 12. Home Page Prompt

```text
Create a professional SaaS landing page explaining:
- What the product does
- How it works
- Agent pipeline
- Product workspaces
- Use cases
- Trust and transparency
- Technical architecture
- FAQ
```

### AI Contribution

The AI helped create the following sections:

* Hero section
* Market intelligence strip
* Integrations flow
* Product showcase
* Use cases section
* Trust section
* Results preview section
* Demo scenarios section
* FAQ section
* Keyboard shortcuts card
* Technical architecture section
* Final CTA section

---

## 13. Research Workspace Prompt

```text
Create a professional Research tab where the user can run one company research.

The page should include:
- Workspace overview
- Professional search form
- Provider status
- Loading workflow
- Empty state
- Professional report view
- Recent history
```

### AI Contribution

The AI helped create:

* `ProfessionalSearchPanel`
* `WorkspaceOverview`
* `ProfessionalSystemStatus`
* `ProfessionalLoadingAgent`
* `ProfessionalEmptyState`
* `ProfessionalReportView`
* `ProfessionalRecentHistory`

---

## 14. Compare Workspace Prompt

```text
Create a professional Compare tab where the user can compare 2–3 companies.

The page should include:
- Comparison input
- Provider status
- Loading workflow
- Winner card
- Score comparison
- Ranking reasoning
- Key tradeoffs
- Data quality summary
- Export comparison button
```

### AI Contribution

The AI helped create:

* `ProfessionalCompareView`
* Comparison score cards
* Winner summary
* Ranking reasoning
* Tradeoff panel
* Data quality panel
* Markdown export

---

## 15. History Workspace Prompt

```text
Create a local saved history page using localStorage.

It should show:
- Saved research reports
- Saved comparisons
- Score
- Decision
- Created time
- Clear history button
- Reopen saved report
```

### AI Contribution

The AI helped implement local browser-based history using `localStorage`.

History supports:

* Single-company research reports
* Comparison reports
* Reopening saved outputs
* Clearing saved history

No database is required for the demo version.

---

## 16. Export Feature Prompt

```text
Add export buttons so users can download or copy reports as Markdown.
```

### AI Contribution

The AI helped create:

* Single-company Markdown export
* Comparison Markdown export
* Copy-to-clipboard action
* Download `.md` file action

This improved submission value because outputs can be included as example reports.

---

## 17. Theme and UX Prompt

```text
Add professional UX features:
- Dark/light theme toggle
- Theme persistence
- Ctrl + K command palette
- Route-level loading page
- Runtime error page
- 404 page
```

### AI Contribution

The AI helped create:

* Theme initialization script
* Floating navbar theme toggle
* Command palette
* Professional loading page
* Professional error page
* Professional 404 page

---

## 18. Debugging Prompt Example

```text
Error: setCompany, setError, setLoading, setComparison are undefined inside runDemoResearch.
```

### AI Contribution

The AI identified that `runDemoResearch()` and `runDemoCompare()` were placed outside the `Home()` component.

Fix:

```text
Move runDemoResearch and runDemoCompare inside the Home component because they need access to React state setters.
```

---

## 19. Security Prompt

```text
How should API keys be handled for submission?
```

### AI Contribution

The AI recommended:

* Keep real keys only in `.env.local`
* Do not commit `.env.local`
* Commit `.env.example`
* Rotate exposed keys if they were shared publicly
* Use Vercel environment variables during deployment

---

## 20. Documentation Prompt

```text
Create README, AI chat logs, example runs, and final submission checklist.
```

### AI Contribution

The AI helped draft:

* `README.md`
* `AI_CHAT_LOGS.md`
* `.env.example`
* Planned `EXAMPLE_RUNS.md`
* Planned `FINAL_SUBMISSION_CHECKLIST.md`

---

## 21. Summary of AI Usage

AI was used for:

* Product ideation
* Architecture planning
* LangGraph workflow design
* TypeScript type design
* API route planning
* Scoring model design
* Gemini memo prompt design
* Error handling strategy
* Fallback strategy
* Frontend UI design
* React component generation
* Debugging support
* Documentation drafting
* Submission planning

---

## 22. Developer Role

The developer was responsible for:

* Running the project locally
* Adding API keys
* Testing API responses
* Debugging build/runtime issues
* Choosing final UI direction
* Reviewing generated code
* Integrating files into the project
* Validating results
* Preparing final submission

---

## 23. Final AI Usage Statement

AI was used as a coding and product development assistant. It helped generate architecture suggestions, code drafts, UI components, documentation, and debugging guidance. The final project was assembled, tested, and validated by the developer.

The project is not a simple prompt-only solution. It includes real code, working API routes, deterministic scoring, external API integration, LangGraph workflow orchestration, frontend state management, export features, local history, and professional UI design.
