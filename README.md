# EquityLens AI

**Research a company, understand the evidence, and make a more informed investment decision.**

[Live application](https://equity-lens-beta.vercel.app/) · [GitHub repository](https://github.com/shudhanshu002/equity-lens)

EquityLens AI is a full-stack investment research workspace. Give it a company name and a group of specialized agents resolves the ticker, gathers available financial and news data, scores the business, and produces an explainable research memo.

It is designed to make research easier to follow—not to hide everything behind a single AI-generated answer. Reports show the data source, evidence quality, confidence, agent progress, risks, valuation context, and the reasoning behind each result.

> **Important:** EquityLens is an educational research tool, not a financial adviser. Provider data can be delayed, incomplete, or unavailable. Always verify important figures before making an investment decision.

## Overview - what it does

- Research public companies using natural-language prompts.
- Compare up to four companies in a single report.
- Review financial growth, profitability, balance-sheet, valuation, and sentiment scores.
- See the multi-agent workflow while a report is being generated.
- Ask follow-up questions about the company already being researched.
- Save research and comparison history to your account.
- Maintain a personal watchlist and portfolio ideas.
- Export reports in formats such as Markdown, JSON, CSV, and PDF.
- Sign in with Google or an email/password account protected by OTP verification.
- Manage users, health information, audits, cleanup, and exports through admin tools.
- Switch between light and dark themes.

## How it works - approach and architecture

```text
Your question
    ↓
Resolve the company and public ticker
    ↓
Collect available financial information
    ↓
Collect and filter relevant company news
    ↓
Score growth, profitability, balance sheet,
valuation, and market sentiment
    ↓
Apply evidence and recommendation safeguards
    ↓
Generate an explainable investment memo
```

The workflow is built with LangGraph. Each stage adds structured data to shared research state, making failures and fallbacks visible instead of silently inventing missing information.

### Data sources and fallbacks

EquityLens uses several providers because no single source covers every company reliably:

| Purpose | Primary source | Fallback or additional source |
| --- | --- | --- |
| US company fundamentals | Alpha Vantage | SEC EDGAR, then clearly labelled demo data |
| NSE/BSE fundamentals | Yahoo Finance fundamentals time series | Limited public-listing coverage |
| Company and ticker discovery | Provider symbol search | Yahoo Finance search |
| Company news | Finnhub | General web research or labelled fallback data |
| Memo generation | Google Gemini | Deterministic fallback reasoning |

When verified financial coverage is too limited, the application returns `INSUFFICIENT_DATA` instead of presenting a confident investment recommendation.

## Key decisions and trade-offs

This project was built as an explainable research assistant, not as an automated stock picker. A few decisions shaped almost every part of the implementation.

### A workflow instead of one large prompt

The research process is split into LangGraph nodes for company resolution, financial collection, news collection, scoring, and memo generation. This takes more code than sending everything to Gemini at once, but it makes the system easier to inspect, test, and recover when one provider fails.

### Deterministic scoring, LLM-written explanation

Financial scores and recommendation gates are calculated in TypeScript. Gemini receives the collected evidence and explains it in a readable memo. This keeps the model from freely inventing a score, while still using an LLM where it adds the most value: synthesis and communication.

### Missing data stays missing

The system does not silently turn an unavailable value into zero. It shows a dash, lowers evidence completeness, records the provider warning, and can return `INSUFFICIENT_DATA`. The trade-off is that some reports look less complete, but they are more honest.

### Multiple providers instead of one perfect provider

Alpha Vantage works well for many US listings, SEC EDGAR adds filing-backed coverage, and Yahoo's fundamentals time-series endpoint helps with NSE/BSE companies. Supporting multiple sources adds normalization and fallback complexity, but gives the application much broader company coverage.

### One company per research chat

Follow-up questions remain attached to the company that started the chat. Full entity switching inside an existing conversation was left out to keep context handling predictable. The UI tells users to start a new chat when they want to research another company.

### Comparisons reuse the research pipeline

A comparison runs the same research workflow for every company in parallel, then creates a comparison memo from those structured reports. This avoids maintaining two different definitions of financial quality, although comparison time is still limited by the slowest provider request.

### Product scope

Research and Compare are the core, production-focused experiences. Authentication, history, watchlists, exports, settings, and admin tools demonstrate the surrounding SaaS architecture, but a future iteration would give those secondary areas the same depth of end-to-end testing as the two core workflows.

The project deliberately does **not** place trades, connect to brokerage accounts, predict exact prices, provide real-time exchange data, or claim fiduciary-grade advice.

## Example runs

These are shortened examples from development runs. Output changes as market data, news, and provider availability change, so they should be read as demonstrations of behavior rather than permanent investment conclusions.

### 1. Research: Tata Consultancy Services (TCS)

**Input**

```text
TCS
```

**Resolved company**

```text
Tata Consultancy Services Limited
Ticker: TCS.NS
Exchange: NSE
Financial source: YAHOO_FINANCE_FUNDAMENTALS
```

**Selected financial output from the tested response**

| Metric | Value |
| --- | ---: |
| Revenue growth YoY | 12.09% |
| Profit margin | 18.47% |
| Operating margin | 23.96% |
| P/E ratio | 15.03 |
| EPS | 137.64 |
| Market capitalization | approximately INR 7.49T |

This run is also a useful example of a provider trade-off: Yahoo's crumb-protected quote endpoint returned `401`, so EquityLens uses the working fundamentals time-series endpoint and derives growth and margins from reported values.

### 2. Compare: TCS vs Infosys

**Input**

```text
TCS, Infosys
```

**Shortened output**

```text
TCS
  Resolved as: TCS.NS
  Financial source: Yahoo Finance fundamentals
  Revenue growth: 12.09%
  Profit margin: 18.47%
  P/E: 15.03

Infosys
  Resolved as: INFY
  Financial source: Alpha Vantage
  Revenue growth: 6.60%
  Profit margin: 16.40%
  P/E: 13.68
```

The comparison then applies the same scoring model to both structured reports and asks Gemini to explain the winner, trade-offs, risks, and evidence quality. It does not rank companies only by one metric such as P/E.

### 3. A company with incomplete financial coverage

If EquityLens resolves a public company but cannot retrieve enough verified fundamentals, the result is intentionally similar to this:

```text
Decision: INSUFFICIENT_DATA
Confidence: low
Financial completeness: below recommendation threshold
Next action: save as a research target and wait for verified financial evidence
```

This is a successful safety outcome, not a failed prompt. The system refuses to turn news snippets or listing information into a confident investment recommendation.

## Main technology

- **Framework:** Next.js 16, React 19, TypeScript
- **UI:** Tailwind CSS 4, Lucide icons, Recharts
- **Agent orchestration:** LangGraph and LangChain
- **AI model:** Google Gemini
- **Authentication:** NextAuth with Google and credentials providers
- **Database:** PostgreSQL, Prisma 7
- **Email:** Nodemailer with SMTP
- **Validation:** Zod
- **Deployment:** Vercel

## Project structure

```text
equitylens-ai/
├── prisma/
│   ├── migrations/              # Database migration history
│   └── schema.prisma            # Users, sessions, OTPs, history, exports, settings
├── src/
│   ├── app/
│   │   ├── api/                 # Research, compare, auth, user, and admin APIs
│   │   ├── auth/                # Login and signup pages
│   │   ├── admin/               # Administration workspace
│   │   ├── history/             # Saved research history
│   │   ├── portfolio/           # Portfolio workspace
│   │   ├── watchlist/           # Watchlist workspace
│   │   └── page.tsx             # Main research and comparison experience
│   ├── components/
│   │   ├── auth/                # Authentication and account UI
│   │   └── research/            # Research, reports, comparison, exports, and navigation
│   ├── lib/
│   │   ├── auth/                # NextAuth, password, OTP, and email logic
│   │   ├── compare/             # Multi-company comparison runner
│   │   ├── db/                  # Prisma database client
│   │   ├── follow-up/           # Research and comparison follow-up handling
│   │   ├── langgraph/           # Agent graph, shared state, and workflow nodes
│   │   ├── scoring/             # Explainable investment scoring model
│   │   ├── services/            # Financial, filing, search, news, and AI providers
│   │   ├── types/               # Shared TypeScript domain types
│   │   └── user-data/           # Client helpers for saved user information
│   └── middleware.ts            # Route access and request middleware
├── tests/                       # Scoring model tests
├── .env.example                 # Example provider configuration
├── prisma.config.ts             # Prisma datasource and migration config
└── package.json                 # Scripts and dependencies
```

## How to run it

### 1. Prerequisites

Install the following before starting:

- Node.js 20 or newer
- npm
- A PostgreSQL database
- A Google Gemini API key
- An Alpha Vantage API key

Finnhub, Google OAuth, and SMTP are optional for basic development, but are needed for their respective production features.

### 2. Clone and install

```bash
git clone https://github.com/shudhanshu002/equity-lens.git
cd equity-lens
npm install
```

### 3. Configure the environment

Copy the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Add the following values to `.env`:

```env
# Database and authentication
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional if using credentials only)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Research providers
ALPHA_VANTAGE_API_KEY=""
GOOGLE_API_KEY=""
GOOGLE_MODEL="gemini-2.5-flash"
FINNHUB_API_KEY=""
SEC_USER_AGENT="EquityLens your-email@example.com"

# OTP email delivery (optional during local development)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="EquityLens <no-reply@example.com>"
```

Generate `AUTH_SECRET` with a secure random-value tool. Never commit the completed `.env` file or expose provider keys in browser-side code.

If SMTP is not configured during local development, OTP codes are written to the server terminal. Configure SMTP before deploying a public instance.

### 4. Prepare the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate Prisma Client and create a production build |
| `npm start` | Start the compiled production server |
| `npm run lint` | Run ESLint |
| `npm run test:scoring` | Run the investment-scoring tests |

## Authentication and personal data

Guests can explore the public research experience. Signing in enables user-specific features such as history, settings, watchlists, portfolio ideas, and exports.

Credential accounts follow this flow:

1. Create an account with name, email, and password.
2. Receive a six-digit OTP by email.
3. Verify the email address.
4. Sign in and begin saving research.

Google OAuth accounts are verified through Google. Passwords and OTPs are stored as hashes, sessions use NextAuth, and user-owned database records are related through Prisma with cascading cleanup.

## Research behavior worth knowing

- Use one research chat for one company. Start a new chat when switching companies.
- Missing data is represented as unavailable rather than being converted to zero.
- A fallback provider is always identified in report metadata.
- Research history is stored only for signed-in users.
- Existing saved reports preserve the data that was available when they were created.
- Scores summarize available evidence; they are not price targets or guarantees.

## What I would improve with more time

The next improvements would focus on reliability before adding more visible features:

1. **Entity switching in chat.** Detect when a user names a new company and offer to start a fresh research context automatically.
2. **Provider caching and retry queues.** Cache stable fundamentals, retry temporary failures, and reduce repeated requests during comparisons.
3. **Broader international coverage.** Add another licensed fundamentals provider and normalize fiscal periods across exchanges.
4. **Stronger automated tests.** Add provider contract tests, mocked LangGraph integration tests, and browser-level Research/Compare tests. The current scoring-test script also needs its Node ESM import resolution corrected.
5. **Streaming progress.** Stream node completion from the server instead of approximating progress entirely in the client.
6. **Source-level citations.** Connect each financial metric and memo claim directly to its filing, provider field, or news URL.
7. **Historical charts.** Add revenue, earnings, margin, cash-flow, and valuation trends instead of showing only a snapshot.
8. **Comparison controls.** Let users choose weighting, time horizon, risk profile, and benchmark before ranking companies.
9. **Observability.** Add structured logs, provider latency dashboards, error tracking, and alerts for quota exhaustion.
10. **Focused MVP navigation.** Keep only Home, Research, and Compare visible until secondary workspaces receive full production testing.

## AI-assisted development and chat logs

This project was built through an iterative conversation with an AI coding assistant. The assistant helped inspect the repository, trace provider failures, modify the UI, test API responses, validate production builds, and improve documentation. The final architectural and product choices remained developer decisions and were verified against the working code.

The curated development transcript is included in [AI_CHAT_LOGS.md](./AI_CHAT_LOGS.md). It records the user prompts, actions taken, test results, and important decisions without exposing API keys, passwords, private environment values, or hidden model reasoning.

Examples of AI-assisted work include:

- simplifying the unauthenticated navbar and authentication UI;
- diagnosing clipped login content;
- tracing empty TCS fundamentals to Yahoo's `401 Invalid Crumb` response;
- switching NSE/BSE data collection to Yahoo's working fundamentals time-series API;
- testing a real TCS vs Infosys comparison response;
- correcting automatic scroll behavior after a research response;
- documenting the one-company-per-chat limitation; and
- turning the default Next.js README into this project guide.

## Deploy to Vercel

1. Import the [GitHub repository](https://github.com/shudhanshu002/equity-lens) into Vercel.
2. Add the production environment variables listed above.
3. Set `NEXTAUTH_URL` to the production URL.
4. Add the production callback URL to the Google OAuth application:

   ```text
   https://your-domain.com/api/auth/callback/google
   ```

5. Ensure the PostgreSQL database accepts connections from the deployed application.
6. Apply production migrations:

   ```bash
   npx prisma migrate deploy
   ```

The current deployment is available at [equity-lens-beta.vercel.app](https://equity-lens-beta.vercel.app/).

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a focused feature branch.
3. Make and test your changes.
4. Run lint and the scoring tests.
5. Open a pull request explaining what changed and why.

When changing financial logic, preserve the project’s most important rule: **unknown data must remain unknown**. Do not replace missing evidence with a confident-looking value.

## License

No license file is currently included. Unless a license is added, the source remains protected by standard copyright rules.

---

Built by [Shudhanshu Kumar Singh](https://github.com/shudhanshu002) as an explainable, full-stack AI investment research project.
