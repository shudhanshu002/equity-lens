export type FollowUpIntent =
  | "LATEST_NEWS"
  | "RECENT_GROWTH"
  | "COMPETITORS"
  | "RISKS"
  | "VALUATION"
  | "COMPARE"
  | "DECISION_UPDATE"
  | "GENERAL_QUESTION";

export function classifyFollowUpIntent(question: string): FollowUpIntent {
  const q = question.toLowerCase();

  if (
    q.includes("latest news") ||
    q.includes("recent news") ||
    q.includes("news") ||
    q.includes("what happened") ||
    q.includes("update")
  ) {
    return "LATEST_NEWS";
  }

  if (
    q.includes("growth") ||
    q.includes("revenue") ||
    q.includes("profit") ||
    q.includes("earnings") ||
    q.includes("expansion") ||
    q.includes("sales")
  ) {
    return "RECENT_GROWTH";
  }

  if (
    q.includes("competitor") ||
    q.includes("competition") ||
    q.includes("rival") ||
    q.includes("peer") ||
    q.includes("against")
  ) {
    return "COMPETITORS";
  }

  if (
    q.includes("risk") ||
    q.includes("problem") ||
    q.includes("threat") ||
    q.includes("concern") ||
    q.includes("weakness")
  ) {
    return "RISKS";
  }

  if (
    q.includes("valuation") ||
    q.includes("expensive") ||
    q.includes("cheap") ||
    q.includes("price") ||
    q.includes("market cap") ||
    q.includes("p/e") ||
    q.includes("pe ratio")
  ) {
    return "VALUATION";
  }

  if (
    q.includes("compare") ||
    q.includes("vs") ||
    q.includes("versus") ||
    q.includes("better than")
  ) {
    return "COMPARE";
  }

  if (
    q.includes("still invest") ||
    q.includes("decision changed") ||
    q.includes("should i buy") ||
    q.includes("should i invest") ||
    q.includes("change decision")
  ) {
    return "DECISION_UPDATE";
  }

  return "GENERAL_QUESTION";
}