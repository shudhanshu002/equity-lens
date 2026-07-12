export function dedupeResearchMetadata<T extends { metadata?: any }>(report: T): T {
  if (!report?.metadata) return report;

  const warnings = Array.isArray(report.metadata.warnings)
    ? Array.from(new Set(report.metadata.warnings))
    : [];

  const trace = Array.isArray(report.metadata.trace)
    ? dedupeTrace(report.metadata.trace)
    : [];

  return {
    ...report,
    metadata: {
      ...report.metadata,
      warnings,
      trace,
    },
  };
}

function dedupeTrace(trace: any[]) {
  const seen = new Set<string>();

  return trace.filter((item) => {
    const key = [
      item.step,
      item.status,
      item.provider,
      item.message,
    ].join("|");

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}
