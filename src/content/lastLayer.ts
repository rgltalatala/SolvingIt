export const LAST_LAYER_SUB_LESSON_LABELS = {
  orientEdges: 'Orient edges',
  permuteEdges: 'Permute edges',
  permuteCorners: 'Permute corners',
  orientCorners: 'Orient corners',
} as const;

export const lastLayerLesson = {
  title: 'Lesson: Last layer',
  defaultStepTitle: 'Last layer',
  subLessonPrefix: 'Sub-lesson:',
  progressPrefix: 'Progress:',
  goToWhiteCross: 'Go to white cross lesson',
  goToWhiteCorners: 'Go to white corners lesson',
  goToMiddleLayer: 'Go to middle layer edges lesson',
  completeBody:
    "The last layer is done. You've worked through orient edges, permute edges, permute corners, and orient corners. Head back to the cube overview whenever you're ready.",
  preparingSubtitle: 'Finding a demo for this last-layer step…',
  progress: {
    orientEdges: (solved: number) =>
      `${solved}/4 top edges oriented (yellow sticker on U)`,
    permuteEdges: (solved: number) =>
      `${solved}/4 edges permuted (side color matching center)`,
    permuteCorners: (solved: number) =>
      `${solved}/4 corners permuted (side colors matching centers)`,
    orientCorners: (solved: number) =>
      `${solved}/4 corners oriented (yellow on U)`,
  },
} as const;

export const lastLayerSteps = {
  prerequisite: {
    title: 'Finish the first two layers first',
    body: "Complete the white cross, all four white corners, and all four middle-layer edges before last-layer work. The bottom two layers need to be solid.",
  },
  lastLayerComplete: {
    title: 'Last layer complete',
    body: "Every top corner shows yellow on U and matches its side centers. Hold blue toward you (white on bottom, yellow on top) and check the diagram. You've solved the last layer.",
  },
  lastLayerEdgesComplete: {
    title: 'Top edges permuted',
    body: "All four top edge side stickers match their centers. Hold blue toward you (white on bottom, yellow on top) and confirm the diagram.",
  },
  lastLayerCornersPermuted: {
    title: 'Top corners permuted',
    body: "All four top corner side stickers match their centers. Hold blue toward you (white on bottom, yellow on top) and confirm the diagram.",
  },
  faceBlueEdges: {
    title: 'Face the blue side',
    body: 'Top edges are permuted. Turn the cube so blue is toward you again. White on bottom, yellow on top.',
  },
  faceBlueCorners: {
    title: 'Face the blue side',
    body: 'Top corners are permuted. Turn the cube so blue is toward you again. White on bottom, yellow on top.',
  },
  faceBlueOriented: {
    title: 'Face the blue side',
    body: 'Top corners are oriented. Turn the cube so blue is toward you again. White on bottom, yellow on top.',
  },
  faceSideTitle: (faceLabel: string) => `Face the ${faceLabel} side`,
  alignPatternTitle: (pattern: string) => `Line up the ${pattern}`,
  yellowCrossDot: {
    title: 'Make the yellow cross (dot case)',
    body: "No top edges show yellow on U yet. Run the full sequence: L-shape algorithm, a U turn, then the bar algorithm. Your bottom and middle layers won't be touched.",
  },
  orientEdgesL: {
    title: 'Orient edges. L shape',
    body: "Yellow-on-U edges sit at UB and UL. This algorithm flips the remaining edges into place. Run F U R U' R' F' to finish the yellow cross.",
  },
  orientEdgesBar: {
    title: 'Orient edges. Bar',
    body: "Yellow-on-U edges sit at UL and UR. Run F R U R' U' F' to complete the yellow cross.",
  },
  alignTopLayer: {
    title: 'Line up the top layer',
    body: 'A single U turn can permute all four top edges. Turn U until each edge side sticker lines up with its center.',
  },
  inspectTopLayer: {
    title: 'Check the top layer',
    body: "Turn U and look for edges that already match their side centers. You're aiming to spot two correct ones for the next step.",
  },
  permuteTopEdges: {
    title: 'Permute top edges',
    body: (caseNote: string) =>
      `${caseNote} Run R U R' U R U2 R' U to cycle the top-layer edges. When you're done, each side sticker should match its center.`,
  },
  permuteEdgesAdjacentNote:
    'The two correct edges are at back and right on U.',
  permuteEdgesOppositeNote:
    'Two opposite edges match their centers. One pass of the algorithm usually sets up the adjacent case.',
  reorientEdges: (faceLabel: string) =>
    `Two top edges already match their side centers. Turn the whole cube so ${faceLabel} is toward you, with those edges at back and right on U. Then run the permutation algorithm on the next step.`,
  reorientCorners: (faceLabel: string) =>
    `One top corner already has its side colors in place. Turn the whole cube so ${faceLabel} is toward you, with that corner at front-right on U. Then run the permutation algorithm on the next step.`,
  alignPattern: (pattern: string, target: string) =>
    `Two top edges show yellow on U in a ${pattern} pattern. Turn U so those edges sit at ${target}. Then you can run the matching algorithm on the next step.`,
  turnCubeOver: {
    title: 'Turn the cube over in your hands',
    body: 'Turn the whole cube halfway (y2) so green is toward you, then run the same corner permutation algorithm again on the next step.',
  },
  permuteCornersZeroFlowFirst: {
    title: 'Permute top corners',
    body: "No top corners have their side colors in place yet. Run U R U' L' U R' U' L, turn the cube with y2, then run the same algorithm again. All four corners will be permuted.",
  },
  permuteCornersZeroFlowSecond: {
    title: 'Permute top corners again',
    body: "Run U R U' L' U R' U' L once more. All four top corner side stickers should match their adjacent centers.",
  },
  permuteCornersOne: {
    title: 'Permute top corners',
    body: "The correct corner is at front-right on U. Run U R U' L' U R' U' L to cycle the top-layer corners. If not all four side colors match afterward, run the same algorithm again.",
  },
  alignOrientCorners: {
    title: 'Line up the top layer',
    body: 'The front-right corner on U is already oriented. Turn U to bring the next unsolved corner to front-right, then run the orientation algorithm on the next step.',
  },
  orientFrontRightCorner: {
    title: 'Orient the front-right corner',
    body: (repLabel: string) =>
      `The unsolved corner is at front-right on U. Run R' D' R D ${repLabel} until yellow faces up on that corner. Then turn U to the next unsolved corner and repeat.`,
  },
  orientCornersTwice: 'twice',
  orientCornersFourTimes: 'four times',
} as const;
