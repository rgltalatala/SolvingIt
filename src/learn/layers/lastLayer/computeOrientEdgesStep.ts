import type { CubeState, Move } from '../../../cube/cubeState';
import {
  alignMovesForBar,
  alignMovesForLShape,
  algorithmForOrientEdgesCase,
  DOT_ALG,
} from './orientEdges/orientEdgesAlgs';
import {
  isBarAligned,
  isLShapeAligned,
  recognizeOrientEdgesCase,
} from './orientEdges/orientEdgesCases';
import type { LastLayerLessonStep, OrientEdgesOllCase } from './types';

function buildAlignUStep(
  ollCase: 'l-shape' | 'bar',
  alignMoves: Move[],
): LastLayerLessonStep {
  const patternLabel = ollCase === 'l-shape' ? 'L shape' : 'bar';
  const targetLabel =
    ollCase === 'l-shape'
      ? 'back and left edges (UB and UL)'
      : 'left and right edges (UL and UR)';
  return {
    kind: 'align-u',
    subLesson: 'orient-edges',
    title: `Align the ${patternLabel}`,
    body: `Two top edges show yellow on U in a ${patternLabel} pattern. Turn the top layer (U) so those edges sit at the ${targetLabel} positions, then you can run the matching algorithm on the next step.`,
    demoMoves: alignMoves,
    ollCase,
  };
}

function buildOrientEdgesStep(
  ollCase: OrientEdgesOllCase,
  algMoves: Move[],
): LastLayerLessonStep {
  if (ollCase === 'dot') {
    return {
      kind: 'orient-edges',
      title: 'Make the yellow cross (dot case)',
      body: 'No top edges show yellow on U yet. Run this full sequence: first the L-shape algorithm, a U turn, then the bar algorithm. Your bottom and middle layers stay intact.',
      demoMoves: algMoves,
      ollCase,
    };
  }

  if (ollCase === 'l-shape') {
    return {
      kind: 'orient-edges',
      title: 'Orient edges — L shape',
      body: "The yellow-on-U edges are aligned at UB and UL. Run F U R U' R' F' to flip the remaining edges and complete the yellow cross.",
      demoMoves: algMoves,
      ollCase,
    };
  }

  return {
    kind: 'orient-edges',
    title: 'Orient edges — bar',
    body: "The yellow-on-U edges are aligned at UL and UR. Run F R U R' U' F' to complete the yellow cross.",
    demoMoves: algMoves,
    ollCase,
  };
}

export function computeOrientEdgesStep(
  studentState: CubeState,
): LastLayerLessonStep {
  const ollCase = recognizeOrientEdgesCase(studentState);

  if (ollCase.kind === 'dot') {
    return buildOrientEdgesStep('dot', DOT_ALG);
  }

  if (ollCase.kind === 'l-shape') {
    if (!isLShapeAligned(ollCase.slots)) {
      const alignMoves = alignMovesForLShape(ollCase.slots);
      if (alignMoves.length > 0) {
        return buildAlignUStep('l-shape', alignMoves);
      }
    }
    return buildOrientEdgesStep('l-shape', algorithmForOrientEdgesCase('l-shape'));
  }

  if (ollCase.kind === 'bar') {
    if (!isBarAligned(ollCase.slots)) {
      const alignMoves = alignMovesForBar(ollCase.slots);
      if (alignMoves.length > 0) {
        return buildAlignUStep('bar', alignMoves);
      }
    }
    return buildOrientEdgesStep('bar', algorithmForOrientEdgesCase('bar'));
  }

  throw new Error('computeOrientEdgesStep: unexpected solved case in orient phase');
}
