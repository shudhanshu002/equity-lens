import type { FinancialSnapshot, HistoricalFinancialPeriod } from "@/lib/types/research";

type SecFactUnit = { start?: string; end?: string; val?: number; fy?: number; fp?: string; form?: string; filed?: string; frame?: string };
type SecCompanyFacts = { facts?: { "us-gaap"?: Record<string, { units?: Record<string, SecFactUnit[]> }> } };
type TickerEntry = { cik_str: number; ticker: string; title: string };

const SEC_HEADERS = {
  "User-Agent": process.env.SEC_USER_AGENT ?? "EquityLens research-app contact@example.com",
  Accept: "application/json",
};

export async function fetchSecFinancials(symbol: string) {
  const tickerResponse = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: SEC_HEADERS,
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!tickerResponse.ok) throw new Error(`SEC ticker lookup failed (${tickerResponse.status}).`);
  const tickerMap = (await tickerResponse.json()) as Record<string, TickerEntry>;
  const entry = Object.values(tickerMap).find((item) => item.ticker.toUpperCase() === symbol.toUpperCase());
  if (!entry) throw new Error(`No SEC CIK found for ${symbol}.`);

  const cik = String(entry.cik_str).padStart(10, "0");
  const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
    headers: SEC_HEADERS,
    next: { revalidate: 60 * 60 * 6 },
  });
  if (!response.ok) throw new Error(`SEC Company Facts failed (${response.status}).`);
  const data = (await response.json()) as SecCompanyFacts;
  const history = buildHistory(data);
  if (history.length < 2) throw new Error("SEC did not return enough comparable annual periods.");

  const latest = history.at(-1)!;
  const previous = history.at(-2)!;
  const currentAssets = latestFact(data, ["AssetsCurrent"]);
  const currentLiabilities = latestFact(data, ["LiabilitiesCurrent"]);
  const assets = latestFact(data, ["Assets"]);
  const liabilities = latestFact(data, ["Liabilities"]);
  const equity = assets !== undefined && liabilities !== undefined ? assets - liabilities : undefined;

  const financials: FinancialSnapshot = {
    revenueGrowthYoY: percentChange(latest.revenue, previous.revenue),
    profitMargin: ratioPercent(latest.netIncome, latest.revenue),
    operatingMargin: ratioPercent(latest.operatingIncome, latest.revenue),
    debtToEquity: liabilities !== undefined && equity && equity > 0 ? round(liabilities / equity) : undefined,
    currentRatio: currentAssets !== undefined && currentLiabilities ? round(currentAssets / currentLiabilities) : undefined,
    freeCashFlowPositive: latest.freeCashFlow === undefined ? undefined : latest.freeCashFlow > 0,
    history,
  };

  return { financials, cik, companyName: entry.title };
}

function buildHistory(data: SecCompanyFacts): HistoricalFinancialPeriod[] {
  const revenue = annualFacts(data, ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues", "SalesRevenueNet"]);
  const netIncome = annualFacts(data, ["NetIncomeLoss", "ProfitLoss"]);
  const operatingIncome = annualFacts(data, ["OperatingIncomeLoss"]);
  const operatingCashFlow = annualFacts(data, ["NetCashProvidedByUsedInOperatingActivities"]);
  const capex = annualFacts(data, ["PaymentsToAcquirePropertyPlantAndEquipment"]);
  const years = Array.from(new Set([...revenue.keys(), ...netIncome.keys(), ...operatingCashFlow.keys()])).sort().slice(-5);
  return years.map((fiscalYear) => {
    const operating = operatingCashFlow.get(fiscalYear);
    const capital = capex.get(fiscalYear);
    return {
      fiscalYear,
      revenue: revenue.get(fiscalYear),
      netIncome: netIncome.get(fiscalYear),
      operatingIncome: operatingIncome.get(fiscalYear),
      operatingCashFlow: operating,
      capitalExpenditure: capital,
      freeCashFlow: operating !== undefined && capital !== undefined ? operating - Math.abs(capital) : undefined,
    };
  });
}

function annualFacts(data: SecCompanyFacts, tags: string[]) {
  const map = new Map<number, number>();
  for (const tag of tags) {
    const units = data.facts?.["us-gaap"]?.[tag]?.units;
    const facts = units?.USD ?? [];
    for (const fact of facts.filter((item) => item.form === "10-K" && item.fp === "FY" && typeof item.val === "number" && isAnnualDuration(item) && /^CY\d{4}$/.test(item.frame ?? "")).sort((a, b) => String(a.filed).localeCompare(String(b.filed)))) {
      map.set(Number(fact.frame!.slice(2)), fact.val!);
    }
    if (map.size) break;
  }
  return map;
}

function latestFact(data: SecCompanyFacts, tags: string[]) {
  for (const tag of tags) {
    const facts = data.facts?.["us-gaap"]?.[tag]?.units?.USD ?? [];
    const latest = facts.filter((item) => ["10-K", "10-Q"].includes(item.form ?? "") && typeof item.val === "number").sort((a, b) => String(b.filed).localeCompare(String(a.filed)))[0];
    if (latest) return latest.val;
  }
  return undefined;
}

function isAnnualDuration(fact: SecFactUnit) {
  if (!fact.start || !fact.end) return false;
  const days = (new Date(fact.end).getTime() - new Date(fact.start).getTime()) / 86_400_000;
  return days >= 300 && days <= 430;
}

function percentChange(current?: number, previous?: number) { return current !== undefined && previous ? round(((current - previous) / Math.abs(previous)) * 100) : undefined; }
function ratioPercent(value?: number, base?: number) { return value !== undefined && base ? round((value / base) * 100) : undefined; }
function round(value: number) { return Number(value.toFixed(2)); }
