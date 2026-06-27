import type { CubeState, Move } from '../../../cube/cubeState';
import { lastLayerSteps } from '../../../content/lastLayer';
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
    title: lastLayerSteps.alignPatternTitle(patternLabel),
    body: lastLayerSteps.alignPattern(patternLabel, targetLabel),
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
      title: lastLayerSteps.yellowCrossDot.title,
      body: lastLayerSteps.yellowCrossDot.body,
      demoMoves: algMoves,
      ollCase,
    };
  }

  if (ollCase === 'l-shape') {
    return {
      kind: 'orient-edges',
      title: lastLayerSteps.orientEdgesL.title,
      body: lastLayerSteps.orientEdgesL.body,
      demoMoves: algMoves,
      ollCase,
    };
  }

  return {
    kind: 'orient-edges',
    title: lastLayerSteps.orientEdgesBar.title,
    body: lastLayerSteps.orientEdgesBar.body,
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

export function buildOrientEdgesAlreadyCompleteStep(): LastLayerLessonStep {
  return {
    kind: 'orient-edges-already-complete',
    title: lastLayerSteps.orientEdgesAlreadyComplete.title,
    body: lastLayerSteps.orientEdgesAlreadyComplete.body,
  };
}
