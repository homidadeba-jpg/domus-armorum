// Position includes a full entry and exit, independent of the viewport width.
export function readingProgressState(progress, trackWidth, markerWidth) {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const width = Math.max(1, trackWidth);
  const marker = Math.max(1, markerWidth);
  const travel = width + marker + 2;
  const contact = (width + 1) / travel;
  const exit = (p - contact) / (1 - contact);
  const x = -marker - 1 + travel * p;
  return {
    x,
    trailScale: Math.max(0, Math.min(1, x / width)),
    impactOpacity: exit > 0 && exit < 1 ? Math.sin(Math.PI * exit) * 0.7 : 0,
  };
}
