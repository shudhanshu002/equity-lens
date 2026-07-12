import { fetchYahooQuoteSnapshot } from "@/lib/services/yahoo-api";
import type { CompanyProfile } from "@/lib/types/research";

export async function enrichCompanyWithQuote(company: CompanyProfile) {
  if (company.coverageMode !== "PUBLIC_EQUITY") {
    return {
      company,
      provider: "NO_ENRICHMENT",
      warning: null,
    };
  }

  const quoteSymbol = getQuoteSymbol(company);
  const quote = await fetchYahooQuoteSnapshot(quoteSymbol).catch(() => null);

  if (!quote) {
    return {
      company: {
        ...company,
        marketDataSymbol: quoteSymbol,
      },
      provider: "QUOTE_UNAVAILABLE",
      warning: `Quote-level market data was unavailable for ${quoteSymbol}.`,
    };
  }

  return {
    company: {
      ...company,
      marketCap: quote.marketCap ?? company.marketCap ?? null,
      currency: quote.currency ?? company.currency,
      marketDataSymbol: quoteSymbol,
    },
    provider: "YAHOO_FINANCE_QUOTE",
    warning: null,
  };
}

function getQuoteSymbol(company: CompanyProfile) {
  if (company.marketDataSymbol) return company.marketDataSymbol;

  if (company.exchange === "NSE") return `${company.symbol}.NS`;
  if (company.exchange === "BSE") return `${company.symbol}.BO`;

  return company.symbol;
}
