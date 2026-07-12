import test from "node:test";
import assert from "node:assert/strict";
import { calculateInvestmentScore, decideInvestment } from "../src/lib/scoring/investment-score";

test("missing metrics are marked unavailable instead of scored as zero", () => {
  const score = calculateInvestmentScore({ revenueGrowthYoY: 12 }, []);
  assert.equal(score.coverage?.growth, true);
  assert.equal(score.coverage?.profitability, false);
  assert.equal(score.coverage?.valuation, false);
  assert.equal(score.growth, 70);
  assert.equal(score.total, 70);
});

test("negative reported growth remains a real negative signal", () => {
  const score = calculateInvestmentScore({ revenueGrowthYoY: -8 }, []);
  assert.equal(score.coverage?.growth, true);
  assert.equal(score.growth, 25);
});

test("available categories are reweighted without neutral filler", () => {
  const score = calculateInvestmentScore(
    { revenueGrowthYoY: 22, profitMargin: 30 },
    []
  );
  assert.equal(score.growth, 85);
  assert.equal(score.profitability, 60);
  assert.equal(score.total, 74);
});

test("decision thresholds remain deterministic", () => {
  assert.equal(decideInvestment(75), "INVEST");
  assert.equal(decideInvestment(55), "WATCHLIST");
  assert.equal(decideInvestment(54), "PASS");
});
