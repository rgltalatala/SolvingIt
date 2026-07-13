/** Class names for move-sequence demo chips (rotation vs face turns). */

export function demoMoveChipClassName(options: {
  isRotation: boolean;
  done: boolean;
  nextUp: boolean;
}): string {
  const { isRotation, done, nextUp } = options;
  if (isRotation) {
    if (done) return 'bg-violet-900/50 text-violet-200';
    if (nextUp) return 'bg-violet-900/40 text-violet-100 ring-1 ring-violet-600/60';
    return 'bg-violet-950/60 text-violet-300/80';
  }
  if (done) return 'bg-emerald-900/45 text-emerald-200';
  if (nextUp) return 'bg-amber-900/40 text-amber-100 ring-1 ring-amber-700/60';
  return 'bg-slate-800 text-slate-500';
}
