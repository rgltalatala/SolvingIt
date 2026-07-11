import type { Move } from '../cube/cubeState';
import type { CubeState } from '../cube/cubeState';
import { invertMoves } from '../cube/invertMoves';
import {
  FRD_WHITE_ON_F,
  FRD_WHITE_ON_R,
} from '../learn/layers/bottomLayer/corners/directSolveSteps';
import {
  FRD_URF_WHITE_ON_F,
  FRD_URF_WHITE_ON_R,
  FRD_URF_WHITE_ON_U,
} from '../learn/layers/bottomLayer/corners/uLayerSteps';
import { LEFT_INSERT, RIGHT_INSERT } from '../learn/layers/middleLayer/edges/edgeAlgorithms';
import {
  BAR_ALG,
  DOT_ALG,
  L_SHAPE_ALG,
} from '../learn/layers/lastLayer/orientEdges/orientEdgesAlgs';
import { PERMUTE_EDGES_ALG } from '../learn/layers/lastLayer/permuteEdges/permuteEdgesAlgs';
import type { Instruction } from '../learn/studentHold';
import { studentFrameFromSetupMoves } from '../learn/studentFrame';
import {
  PERMUTE_CORNERS_ALG,
  ZERO_FLOW_NONE_PERMUTED_SETUP,
  ZERO_FLOW_PERMUTE_CORNERS_FULL,
  ZERO_FLOW_PERMUTE_PHASES,
} from '../learn/layers/lastLayer/permuteCorners/permuteCornersAlgs';
import { zeroFlowCaseDemoMetadata } from '../learn/layers/lastLayer/permuteCorners/zeroFlowDemo';
import { repeatOrientAlg } from '../learn/layers/lastLayer/orientCorners/orientCornersAlgs';
import { LAST_LAYER_SUB_LESSON_LABELS } from './lastLayer';
import { whiteCornersLesson } from './whiteCorners';
import { middleLayerLesson } from './middleLayer';
import { lastLayerLesson } from './lastLayer';

export type CaseReferenceEntry = {
  id: string;
  group: string;
  title: string;
  alg: string;
  algMoves: readonly Move[];
  setupMoves?: readonly Move[];
};

export type CaseReferenceGroup = {
  heading: string;
  cases: CaseReferenceEntry[];
};

export type CaseReferenceLessonSection = {
  lessonTitle: string;
  groups: CaseReferenceGroup[];
};

export type CaseDemo = {
  setupCube: CubeState;
  moves: Move[];
  instructions?: Instruction[];
  instructionPhaseLengths?: number[];
};

function movesToAlgString(moves: readonly Move[]): string {
  return moves.join(' ');
}

function entry(
  id: string,
  group: string,
  title: string,
  algMoves: readonly Move[],
  setupMoves?: readonly Move[],
): CaseReferenceEntry {
  return {
    id,
    group,
    title,
    alg: movesToAlgString(algMoves),
    algMoves,
    setupMoves: setupMoves ?? invertMoves(algMoves),
  };
}

const ORIENT_CORNERS_F_ALG = repeatOrientAlg(2);
const ORIENT_CORNERS_R_ALG = repeatOrientAlg(4);

const WHITE_CORNERS_GROUPS: CaseReferenceGroup[] = [
  {
    heading: 'URF (corner on top)',
    cases: [
      entry(
        'white-corners:urf:white-u',
        'URF (corner on top)',
        'White on U',
        FRD_URF_WHITE_ON_U,
      ),
      entry(
        'white-corners:urf:white-r',
        'URF (corner on top)',
        'White on R',
        FRD_URF_WHITE_ON_R,
      ),
      entry(
        'white-corners:urf:white-f',
        'URF (corner on top)',
        'White on F',
        FRD_URF_WHITE_ON_F,
      ),
    ],
  },
  {
    heading: 'FRD (corner in slot, twisted)',
    cases: [
      entry(
        'white-corners:frd:white-f',
        'FRD (corner in slot, twisted)',
        'White on F',
        FRD_WHITE_ON_F,
      ),
      entry(
        'white-corners:frd:white-r',
        'FRD (corner in slot, twisted)',
        'White on R',
        FRD_WHITE_ON_R,
      ),
    ],
  },
];

const MIDDLE_LAYER_GROUPS: CaseReferenceGroup[] = [
  {
    heading: 'Front slots (FL / FR)',
    cases: [
      entry(
        'middle-layer:left',
        'Front slots (FL / FR)',
        'Insert into FL',
        LEFT_INSERT,
      ),
      entry(
        'middle-layer:right',
        'Front slots (FL / FR)',
        'Insert into FR',
        RIGHT_INSERT,
      ),
    ],
  },
];

const LAST_LAYER_GROUPS: CaseReferenceGroup[] = [
  {
    heading: LAST_LAYER_SUB_LESSON_LABELS.orientEdges,
    cases: [
      entry('last-layer:dot', LAST_LAYER_SUB_LESSON_LABELS.orientEdges, 'Dot', DOT_ALG),
      entry('last-layer:l', LAST_LAYER_SUB_LESSON_LABELS.orientEdges, 'L', L_SHAPE_ALG),
      entry('last-layer:bar', LAST_LAYER_SUB_LESSON_LABELS.orientEdges, 'Bar', BAR_ALG),
    ],
  },
  {
    heading: LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
    cases: [
      entry(
        'last-layer:permute-edges-adjacent',
        LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
        'Adjacent',
        PERMUTE_EDGES_ALG,
      ),
      entry(
        'last-layer:permute-edges-opposite',
        LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
        'Opposite',
        PERMUTE_EDGES_ALG,
        [
          ...PERMUTE_EDGES_ALG,
          'y2',
          ...invertMoves(PERMUTE_EDGES_ALG),
        ],
      ),
    ],
  },
  {
    heading: LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
    cases: [
      entry(
        'last-layer:permute-corners-zero-flow',
        LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
        'Zero-flow',
        ZERO_FLOW_PERMUTE_CORNERS_FULL,
        ZERO_FLOW_NONE_PERMUTED_SETUP,
      ),
      entry(
        'last-layer:permute-corners-one',
        LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
        'One permuted',
        PERMUTE_CORNERS_ALG,
      ),
    ],
  },
  {
    heading: LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
    cases: [
      entry(
        'last-layer:orient-corners-f',
        LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
        'Sticker on F',
        ORIENT_CORNERS_F_ALG,
      ),
      entry(
        'last-layer:orient-corners-r',
        LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
        'Sticker on R',
        ORIENT_CORNERS_R_ALG,
      ),
    ],
  },
];

const ALL_CASE_SECTIONS: CaseReferenceLessonSection[] = [
  {
    lessonTitle: whiteCornersLesson.title.replace(/^Lesson: /, ''),
    groups: WHITE_CORNERS_GROUPS,
  },
  {
    lessonTitle: middleLayerLesson.title.replace(/^Lesson: /, ''),
    groups: MIDDLE_LAYER_GROUPS,
  },
  {
    lessonTitle: lastLayerLesson.title.replace(/^Lesson: /, ''),
    groups: LAST_LAYER_GROUPS,
  },
];

const CASE_BY_ID = new Map<string, CaseReferenceEntry>(
  ALL_CASE_SECTIONS.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.cases.map((caseEntry) => [caseEntry.id, caseEntry] as const),
    ),
  ),
);

const ZERO_FLOW_PERMUTE_CASE_ID = 'last-layer:permute-corners-zero-flow';

export function getAllCaseReferenceSections(): CaseReferenceLessonSection[] {
  return ALL_CASE_SECTIONS;
}

export function getCaseById(id: string): CaseReferenceEntry | null {
  return CASE_BY_ID.get(id) ?? null;
}

export function getCaseDemo(entry: CaseReferenceEntry): CaseDemo {
  const setup = entry.setupMoves ?? invertMoves(entry.algMoves);
  const demo: CaseDemo = {
    setupCube: studentFrameFromSetupMoves(setup),
    moves: [...entry.algMoves],
  };

  if (entry.id === ZERO_FLOW_PERMUTE_CASE_ID) {
    const { instructions, phaseLengths } = zeroFlowCaseDemoMetadata(
      ZERO_FLOW_PERMUTE_PHASES,
    );
    demo.instructions = instructions;
    demo.instructionPhaseLengths = phaseLengths;
  }

  return demo;
}
