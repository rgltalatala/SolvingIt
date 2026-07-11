import type { CubeState } from '../../cube/cubeState';
import {
  CROSS_ORDER,
  firstUnsolvedCrossId,
  partnerColorForSlot,
  slotSolved,
} from '../../learn/layers/bottomLayer/cross/crossSlotModel';
import type { LessonProgressConfig } from './LessonProgress';

export function crossLessonProgress(
  studentFrame: CubeState,
  progressLabel: (solved: number) => string,
): LessonProgressConfig {
  const currentId = firstUnsolvedCrossId(studentFrame);
  const slots = CROSS_ORDER.map((id) => {
    const solved = slotSolved(studentFrame, id);
    return {
      key: id,
      label: id,
      solved,
      color: partnerColorForSlot(studentFrame, id),
      isCurrent: !solved && id === currentId,
    };
  });
  const solved = slots.filter((slot) => slot.solved).length;

  return {
    solved,
    total: CROSS_ORDER.length,
    slots,
    ariaLabel: progressLabel(solved),
  };
}
