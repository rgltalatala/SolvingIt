import Cube from 'cubejs/lib/cube';
import { validation as validationCopy } from '../content/ui';
import {
  COLOR_TO_FACE,
  COLORS,
  FACE_COLOR_CONVENTION,
  FACE_ORDER,
} from './cubeState';
import type { Color, CubeState, Face } from './cubeState';
import { cubeStateToCubeJsString } from './cubeStateToFacelets';

export interface CubeValidationResult {
  valid: boolean;
  issues: CubeValidationIssue[];
  suggestedFace: Face | null;
}

export type CubeValidationIssueKind =
  | 'color-count'
  | 'duplicate-centers'
  | 'center-mismatch'
  | 'unsolvable';

export interface CubeValidationIssue {
  kind: CubeValidationIssueKind;
  message: string;
  color?: Color;
  face?: Face;
  count?: number;
}

const messages = {
  duplicateCorners: validationCopy.duplicateCorners,
  duplicateEdges: validationCopy.duplicateEdges,
  cornerTwist: validationCopy.cornerTwist,
  edgeFlip: validationCopy.edgeFlip,
  parity: validationCopy.parity,
  parseError: validationCopy.parseError,
} as const;
const colorNames = validationCopy.colorNames;

/** Inversion-count parity of a permutation (0..n-1); matches cubejs cornerParity/edgeParity when solve.js is loaded. */
function permutationParity(perm: number[]): number {
  let inversions = 0;
  for (let i = 0; i < perm.length; i += 1) {
    for (let j = i + 1; j < perm.length; j += 1) {
      if (perm[i] > perm[j]) {
        inversions += 1;
      }
    }
  }
  return inversions % 2;
}

function findSuggestedFace(issues: CubeValidationIssue[]): Face | null {
  const deficitColorIssue = issues.find(
    (issue) =>
      issue.kind === 'color-count' &&
      issue.color &&
      typeof issue.count === 'number' &&
      issue.count < 9,
  );
  if (deficitColorIssue?.color) {
    return COLOR_TO_FACE[deficitColorIssue.color];
  }

  for (const issue of issues) {
    if (issue.face) return issue.face;
    if (issue.color) return COLOR_TO_FACE[issue.color];
  }
  return null;
}

export function validateCubeStateBasic(state: CubeState): CubeValidationResult {
  const issues: CubeValidationIssue[] = [];
  const counts = new Map<Color, number>(COLORS.map((color) => [color, 0]));

  for (const face of FACE_ORDER) {
    for (const sticker of state[face]) {
      counts.set(sticker, (counts.get(sticker) ?? 0) + 1);
    }
  }

  for (const color of COLORS) {
    const count = counts.get(color) ?? 0;
    if (count !== 9) {
      issues.push({
        kind: 'color-count',
        color,
        count,
        message: validationCopy.colorCount(colorNames[color], count),
      });
    }
  }

  const centers = new Set<Color>(FACE_ORDER.map((face) => state[face][4]));
  if (centers.size !== 6) {
    issues.push({
      kind: 'duplicate-centers',
      message: validationCopy.duplicateCenters,
    });
  }

  for (const face of FACE_ORDER) {
    const expectedCenter = FACE_COLOR_CONVENTION[face];
    const actualCenter = state[face][4];
    if (actualCenter !== expectedCenter) {
      issues.push({
        kind: 'center-mismatch',
        face,
        color: actualCenter,
        message: validationCopy.centerMismatch(
          face,
          actualCenter,
          expectedCenter,
        ),
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestedFace: findSuggestedFace(issues),
  };
}

function validateCubeStateSolvable(state: CubeState): CubeValidationIssue[] {
  try {
    const facelets = cubeStateToCubeJsString(state);
    const cube = Cube.fromString(facelets);
    const cubeJson = cube.toJSON() as {
      cp: number[];
      co: number[];
      ep: number[];
      eo: number[];
    };

    const cpOk =
      cubeJson.cp.length === 8 &&
      cubeJson.cp.every((v) => Number.isInteger(v) && v >= 0 && v < 8);
    const epOk =
      cubeJson.ep.length === 12 &&
      cubeJson.ep.every((v) => Number.isInteger(v) && v >= 0 && v < 12);
    if (!cpOk || !epOk) {
      return [{ kind: 'unsolvable', message: messages.parseError }];
    }

    const cornersUnique = new Set(cubeJson.cp).size === cubeJson.cp.length;
    if (!cornersUnique) {
      return [{ kind: 'unsolvable', message: messages.duplicateCorners }];
    }

    const edgesUnique = new Set(cubeJson.ep).size === cubeJson.ep.length;
    if (!edgesUnique) {
      return [{ kind: 'unsolvable', message: messages.duplicateEdges }];
    }

    const cornerOrientationValid =
      cubeJson.co.reduce((sum, value) => sum + value, 0) % 3 === 0;
    if (!cornerOrientationValid) {
      return [{ kind: 'unsolvable', message: messages.cornerTwist }];
    }

    const edgeOrientationValid =
      cubeJson.eo.reduce((sum, value) => sum + value, 0) % 2 === 0;
    if (!edgeOrientationValid) {
      return [{ kind: 'unsolvable', message: messages.edgeFlip }];
    }

    const cornerPermParity = permutationParity(cubeJson.cp);
    const edgePermParity = permutationParity(cubeJson.ep);
    if (cornerPermParity !== edgePermParity) {
      return [{ kind: 'unsolvable', message: messages.parity }];
    }

    return [];
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return [
      { kind: 'unsolvable', message: validationCopy.parseErrorWithDetail(detail) },
    ];
  }
}

export function validateCubeState(state: CubeState): CubeValidationResult {
  const basicResult = validateCubeStateBasic(state);
  if (!basicResult.valid) return basicResult;

  const solvabilityIssues = validateCubeStateSolvable(state);

  return {
    valid: solvabilityIssues.length === 0,
    issues: solvabilityIssues,
    suggestedFace: findSuggestedFace(solvabilityIssues),
  };
}
