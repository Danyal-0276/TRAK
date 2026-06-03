/** Stable signature for dashboard analytics — skip React updates when unchanged. */
export function analyticsSnapshotSignature(snapshot) {
  if (!snapshot) return '';
  const ps = snapshot.pipeline_summary || {};
  return JSON.stringify({
    raw: snapshot.raw_total,
    processed: snapshot.processed_total,
    queued: ps.queued,
    done: ps.done,
    pending: ps.pending,
    processing: ps.processing,
    failed: ps.failed,
    completion: ps.completion_pct,
    generated: snapshot.generated_at,
  });
}
