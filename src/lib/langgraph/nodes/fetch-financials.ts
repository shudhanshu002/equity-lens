import { ResearchState } from "@/lib/langgraph/state";
import { fetchCompanyFinancials } from "@/lib/services/market-data";
import { enrichCompanyWithQuote } from "@/lib/services/quote-enrichment";
import { fetchYahooFundamentalsSnapshot } from "@/lib/services/yahoo-api";

type ResearchStateType = typeof ResearchState.State;

export async function fetchFinancialsNode(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  if (!state.company) {
    throw new Error("Company must be resolved before fetching financials.");
  }

  if (state.company.coverageMode === "GENERAL_COMPANY") {
    return {
      financials: {},
      metadata: {
        agentVersion: "1.0.0",
        financialDataSource: "NOT_AVAILABLE",
        warnings: [
          "No public ticker was resolved, so public-market financial ratios such as P/E, EPS, market cap, and debt-to-equity are not available.",
        ],
        trace: [
          {
            step: "fetch_financials",
            status: "SKIPPED",
            provider: "GENERAL_COMPANY_MODE",
            message:
              "Skipped public-market financial fetch because this company is not resolved to a listed ticker.",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  }

  const isIndianListedCompany =
    state.company.coverageMode === "PUBLIC_EQUITY" &&
    ["NSE", "BSE"].includes(state.company.exchange);

  if (isIndianListedCompany) {
    const enriched = await enrichCompanyWithQuote(state.company);
    const quoteSymbol =
      enriched.company.marketDataSymbol ??
      `${state.company.symbol}.${state.company.exchange === "NSE" ? "NS" : "BO"}`;
    const fundamentals = await fetchYahooFundamentalsSnapshot(quoteSymbol).catch(
      () => null
    );

    if (fundamentals) {
      return {
        status: "FETCHING_FINANCIALS",
        company: {
          ...enriched.company,
          marketCap: fundamentals.marketCap ?? enriched.company.marketCap,
          currency: fundamentals.currency ?? enriched.company.currency,
        },
        financials: fundamentals.financials,
        metadata: {
          ...state.metadata,
          financialDataSource: "YAHOO_FINANCE_FUNDAMENTALS",
          warnings: enriched.warning ? [enriched.warning] : [],
          trace: [
            {
              step: "fetch_financials",
              status: "SUCCESS",
              provider: "YAHOO_FINANCE_FUNDAMENTALS",
              message: `Fetched available financial metrics for ${quoteSymbol}.`,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      };
    }

    return {
      company: enriched.company,
      financials: {},
      metadata: {
        ...state.metadata,
        financialDataSource:
          enriched.provider === "YAHOO_FINANCE_QUOTE"
            ? "YAHOO_FINANCE_QUOTE_LIMITED"
            : "PUBLIC_LISTING_DISCOVERY",
        warnings: [
          `${state.company.name} was resolved as a publicly listed ${state.company.exchange} company. Detailed Alpha Vantage fundamentals may be unavailable for this exchange, so EquityLens used listing/news signals and available quote-level data without inventing stock ratios.`,
          ...(enriched.warning ? [enriched.warning] : []),
        ],
        trace: [
          {
            step: "fetch_financials",
            status:
              enriched.provider === "YAHOO_FINANCE_QUOTE" ? "SUCCESS" : "SKIPPED",
            provider:
              enriched.provider === "YAHOO_FINANCE_QUOTE"
                ? "YAHOO_FINANCE_QUOTE_LIMITED"
                : "PUBLIC_LISTING_DISCOVERY",
            message:
              enriched.provider === "YAHOO_FINANCE_QUOTE"
                ? `Fetched quote-level market data for ${enriched.company.marketDataSymbol}.`
                : `Skipped Alpha Vantage fundamentals for ${state.company.exchange} ticker ${state.company.symbol}; continuing with limited public-equity coverage.`,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  }

  const result = await fetchCompanyFinancials(state.company);

  return {
    status: "FETCHING_FINANCIALS",
    company: {
      ...state.company,
      ...result.companyPatch,
    },
    financials: result.financials,
    metadata: {
      agentVersion: "1.0.0",
      financialDataSource: result.source,
      warnings: result.warning ? [result.warning] : [],
      trace: [
        {
          step: "fetch_financials",
          status: ["ALPHA_VANTAGE", "SEC_EDGAR"].includes(result.source) ? "SUCCESS" : "FALLBACK",
          provider: result.source,
          message:
            result.source === "ALPHA_VANTAGE"
              ? `Fetched financial metrics for ${state.company.symbol} from Alpha Vantage.`
              : result.source === "SEC_EDGAR"
                ? `Fetched filing-backed historical financials for ${state.company.symbol} from SEC EDGAR.`
              : `Used mock financial data for ${state.company.symbol}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  };
}
