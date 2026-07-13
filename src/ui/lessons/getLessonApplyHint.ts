import { applyHints } from '../../content/tips';

/** Hint under the apply/continue button for lesson example workflows. */
export function getLessonApplyHint(options: {
  canApply: boolean;
  isReorient: boolean;
}): string | undefined {
  const { canApply, isReorient } = options;
  if (!canApply) return undefined;
  return isReorient ? applyHints.reorient : applyHints.solve;
}
