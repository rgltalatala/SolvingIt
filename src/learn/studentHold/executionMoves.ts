import type { Move } from '../../cube/cubeState';
import { getLessonExecutionMoves } from './lessonExecution';
import type {
  AvoidBackPrefs,
  BuildExecutionResult,
  StudentHold,
} from './types';
import { noneHold } from './types';

/** Wrapper for callers that already have {@link AvoidBackPrefs}. */
export function buildExecutionMoves(
  rawMoves: Move[],
  prefs: AvoidBackPrefs,
  initialHold: StudentHold = noneHold(),
): BuildExecutionResult {
  return getLessonExecutionMoves(rawMoves, prefs.avoidBackMoves, initialHold);
}
