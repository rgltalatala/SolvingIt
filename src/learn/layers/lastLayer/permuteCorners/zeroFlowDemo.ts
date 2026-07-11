import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import type { Instruction } from '../../../studentHold';
import type { CornerHoldIndex } from '../../bottomLayer/corners/cornerHold';
import { PERMUTE_CORNERS_ALG } from './permuteCornersAlgs';
import {
  reorientPermutedCornerToUrfIfNeeded,
  runPermuteCornersUntilFullyPermuted,
} from './permuteCycle';

export type ZeroFlowPermuteDemo = {
  moves: Move[];
  /** Grouped for case-reference instruction lines (permute, reorient?, repeat). */
  instructionPhases: Move[][];
};

/** Build the full zero-permuted demo: alg once, URF setup, then repeat alg until solved. */
export function buildZeroFlowPermuteDemo(
  nonePermutedState: CubeState,
  startHoldIndex: CornerHoldIndex = 0,
): ZeroFlowPermuteDemo {
  const instructionPhases: Move[][] = [];

  instructionPhases.push([...PERMUTE_CORNERS_ALG]);
  let state = applyMoves(nonePermutedState, PERMUTE_CORNERS_ALG);
  let hold = startHoldIndex;

  const reorient = reorientPermutedCornerToUrfIfNeeded(state, hold);
  state = reorient.state;
  hold = reorient.hold;
  if (reorient.moves.length > 0) {
    instructionPhases.push(reorient.moves);
  }

  const cycle = runPermuteCornersUntilFullyPermuted(state, hold);
  instructionPhases.push(cycle.moves);

  return {
    moves: instructionPhases.flat(),
    instructionPhases,
  };
}

export function zeroFlowCaseDemoMetadata(phases: readonly Move[][]): {
  instructions: Instruction[];
  phaseLengths: number[];
} {
  const alg = PERMUTE_CORNERS_ALG.join(' ');
  const instructions: Instruction[] = [
    {
      type: 'move',
      move: PERMUTE_CORNERS_ALG[0]!,
      label: 'Permute',
      text: `Run ${alg} once.`,
    },
  ];

  if (phases.length > 2) {
    instructions.push({
      type: 'rotation',
      rotation: 'y2',
      label: 'Reorient',
      text: 'Turn the whole cube so the permuted corner sits at URF.',
    });
  }

  instructions.push({
    type: 'move',
    move: PERMUTE_CORNERS_ALG[0]!,
    label: 'Permute',
    text: `Repeat ${alg} until all four top corners are permuted.`,
  });

  const phaseLengths =
    phases.length <= 2
      ? [phases[0]!.length, phases[1]!.length]
      : phases.map((phase) => phase.length);

  return { instructions, phaseLengths };
}
