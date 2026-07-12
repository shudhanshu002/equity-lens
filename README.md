# EquityLens AI

**Research a company, understand the evidence, and make a more informed investment decision.**

[Live application](https://equity-lens-beta.vercel.app/) · [GitHub repository](https://github.com/shudhanshu002/equity-lens)

EquityLens AI is a full-stack investment research workspace. Give it a company name and a group of specialized agents resolves the ticker, gathers available financial and news data, scores the business, and produces an explainable research memo.

It is designed to make research easier to follow—not to hide everything behind a single AI-generated answer. Reports show the data source, evidence quality, confidence, agent progress, risks, valuation context, and the reasoning behind each result.

> **Important:** EquityLens is an educational research tool, not a financial adviser. Provider data can be delayed, incomplete, or unavailable. Always verify important figures before making an investment decision.

## What you can do

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

## How a research request works

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

## Run locally

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
