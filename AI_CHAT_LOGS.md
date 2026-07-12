# EquityLens AI - AI Development Chat Log

This file is a curated transcript of the AI-assisted development work completed on EquityLens AI. It is included to show how the project was inspected, debugged, tested, and refined.

It contains user requests and concise records of the resulting engineering work. It intentionally excludes secrets, private environment values, generated OTPs, and hidden chain-of-thought. The repository history and code remain the source of truth for the final implementation.

## Session 1 - Navbar and authentication layout

**User request**

> Analyze the project. When a user is not logged in, remove the Start button, keep a Get Started button instead of Login, redirect it to the login page, and fix the login page because some content is not visible.

**Work completed**

- Inspected the Next.js app shell, user menu, login route, and reusable authentication modal.
- Replaced the separate Login and Start actions with one Get Started action linked to `/auth/login`.
- Changed the modal from a clipped inner scrolling panel to a full scrollable authentication surface.
- Ran ESLint against the affected files.

## Session 2 - Professional login and logout UI

**User request**

> Change the UI of login/logout and make it professional and concise.

**Work completed**

- Replaced the large marketing-heavy split layout with a focused authentication card.
- Simplified branding, typography, spacing, and visual hierarchy.
- Made the account dropdown smaller and clearer.
- Added a disabled `Signing out...` state with a progress indicator.
- Verified the authentication components with ESLint.

## Session 3 - OTP wording, TCS data, and scrolling

**User request**

> Remove the local SMTP terminal sentence from OTP verification. TCS research has an empty financial snapshot. When a response finishes, the page jumps to the end and then to the top.

**Work completed**

- Removed the implementation-specific SMTP sentence from the OTP page.
- Found that NSE/BSE companies were explicitly routed to an empty financial object.
- Added an NSE/BSE fundamentals provider path.
- Limited automatic scrolling to the beginning of a request so response completion does not trigger a second jump.
- Verified the application with a production build.

## Session 4 - Yahoo provider debugging

**User report**

> The financial snapshot is still empty.

**Investigation**

Live endpoint tests for `TCS.NS` showed:

```text
Yahoo quoteSummary: 401 Invalid Crumb
Yahoo quote endpoint: 401 Unauthorized
Yahoo fundamentals time series: 200 OK
```

**Decision and implementation**

- Replaced the crumb-protected endpoint with Yahoo's working fundamentals time-series endpoint.
- Requested quarterly revenue, net income, operating income, equity, debt, current assets, current liabilities, market multiples, EPS, market cap, and free cash flow.
- Derived year-over-year growth, profit margin, operating margin, return on equity, debt-to-equity, and current ratio from reported values.
- Preserved unavailable fields as unavailable instead of inventing values.
- Ran focused lint checks and a production build.

## Session 5 - Comparison verification

**User request**

> Test and fix this issue during comparison too.

**Work completed**

- Confirmed that comparison reuses the same LangGraph research pipeline for every company.
- Called the real local `/api/compare` endpoint with TCS and Infosys.
- Verified the following shortened response:

```text
TCS.NS
  Source: YAHOO_FINANCE_FUNDAMENTALS
  Revenue growth: 12.09%
  Profit margin: 18.47%
  Operating margin: 23.96%
  P/E: 15.03
  EPS: 137.64

INFY
  Source: ALPHA_VANTAGE
  Revenue growth: 6.60%
  Profit margin: 16.40%
  Operating margin: 20.90%
  P/E: 13.68
  EPS: 0.80
```

This confirmed that the fix reached both Research and Compare rather than only changing the report UI.

## Session 6 - One company per chat

**User request**

> If a chat starts with TCS and I later type Swiggy, it is treated as a follow-up. I do not have time to change the entire behavior, so add a disclaimer above the research input.

**Work completed**

- Added: `Use one chat for one company. Start a new chat to analyze a different company.`
- Removed the misleading instruction that suggested typing another company name would switch context.
- Ran ESLint on the research input component.

## Session 7 - README and project presentation

**User request**

> Create a good README that explains the full project structure in a humanized way.

**Work completed**

- Replaced the default Create Next App README.
- Documented the product, architecture, agent workflow, providers, fallbacks, project tree, environment variables, database setup, authentication, deployment, and safety behavior.
- Added explicit decisions and trade-offs, tested example runs, future improvements, and this AI collaboration log.

## What the AI was used for

The AI assistant supported:

- repository discovery and code navigation;
- debugging and root-cause analysis;
- implementation suggestions and scoped code edits;
- terminal-based API verification;
- lint and production-build validation;
- UX copy and documentation; and
- identifying limitations that should remain visible to users.

The assistant was not used to place trades or generate hidden financial data. Provider output is handled by application code, and missing evidence remains explicitly missing.
