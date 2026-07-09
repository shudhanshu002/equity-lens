function scoreBalanceSheet(financials: FinancialSnapshot): number {
  const debtToEquity = financials.debtToEquity;
  const currentRatio = financials.currentRatio;
  const freeCashFlowPositive = financials.freeCashFlowPositive;

  const debtScore =
    debtToEquity === undefined
      ? 25
      : debtToEquity <= 0.3
        ? 45
        : debtToEquity <= 1
          ? 35
          : debtToEquity <= 2
            ? 20
            : 10;

  const liquidityScore =
    currentRatio === undefined
      ? 20
      : currentRatio >= 2
        ? 35
        : currentRatio >= 1.2
          ? 25
          : currentRatio >= 1
            ? 15
            : 5;

  const fcfScore =
    freeCashFlowPositive === undefined ? 10 : freeCashFlowPositive ? 20 : 0;

  return clamp(debtScore + liquidityScore + fcfScore);
}