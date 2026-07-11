export const middleLayerLesson = {
  title: 'Lesson: Middle layer edges',
  subtitle: 'Insert the four middle-layer edges one at a time.',
  defaultStepTitle: 'Middle layer edges',
  progress: (solved: number) =>
    `Progress: ${solved}/4 middle-layer edges in place (side stickers matching their centers).`,
  resetMiddleSession: 'Reset middle-layer session',
  goToWhiteCross: 'Go to white cross lesson',
  goToWhiteCorners: 'Go to white corners lesson',
  completeBody:
    "All four middle-layer edges are in. When you're ready, tackle the last layer.",
  continueLastLayer: 'Continue: Last layer',
  preparingSubtitle: 'Finding a demo for this middle-layer edge…',
  sessionNotesSummary: 'Lesson session & reset',
  sessionNotes: [
    {
      label: 'Reorient steps',
      text: 'rotate the virtual cube so the right face is toward you.',
    },
    {
      label: 'Undo last example',
      text: 'puts the virtual cube back before the last apply.',
    },
    {
      label: 'Re-scan cube',
      text: "opens the scanner so you can sync the virtual cube with your physical one. We'll figure out where you are and pick up from there.",
    },
    {
      label: 'Reset middle-layer session',
      text: "clears hold tracking and re-counts solved edges from the current cube. Your scramble doesn't change.",
    },
  ],
} as const;

export const middleLayerSteps = {
  intro: {
    title: 'How this lesson works',
    body: `Now we'll solve the four middle-layer edges. Each one has a permanent identity from its two side colors, like the Green–Orange Edge. These pieces have no yellow sticker. Any edge with yellow belongs in the last layer, so leave those alone for now.

Choose a middle-layer edge from the top layer and line up its front sticker with the matching center. Then rotate the entire cube so that center is facing you.

From there, decide whether the edge belongs in FL or FR. Each direction has its own insertion algorithm, and we'll show you exactly which one to use.

Sometimes you'll find an incorrect edge already sitting in a middle-layer slot. That's perfectly normal. We'll use the same algorithm to bring it back to the top, then insert the right piece.

If all of your unsolved middle-layer edges are trapped in the middle, simply remove one first. That creates room to place every edge where it belongs.`,
  },
  complete: {
    title: 'Middle layer edges complete',
    body: "All four middle-layer edges match their side centers. No white or yellow on these pieces. Hold blue toward you (white on bottom, yellow on top) and check the diagram.",
  },
  prerequisite: {
    title: 'Finish the bottom layer first',
    body: "Complete the white cross and all four white corners before middle-layer edges. The whole bottom layer has to be done first.",
  },
  faceBlue: {
    title: 'Face the blue side',
    body: 'Middle-layer edges are done. Turn the cube so blue is toward you again. White on bottom, yellow on top.',
  },
  faceBack: {
    title: 'Face the back side',
    body: "The front middle-layer edges look good, but the back still needs work. Turn the cube so the back face is toward you. White on bottom, yellow on top.",
  },
  faceSideTitle: (color: string) => `Face the ${color} side`,
  alignPartnerTitle: (color: string) => `Line up ${color} with its center`,
  extractEdge: 'Lift the edge out',
  insertAlignedEdge: 'Insert the aligned top-layer edge',
  insertEdge: 'Insert the edge',
  alignU: (edgeLabel: string, partner: string) =>
    `The ${edgeLabel} is on the top layer. Turn U until the ${partner} sticker lines up with the ${partner} center. Then you can turn the whole cube.`,
  reorient: (faceLabel: string, edgeLabel: string) =>
    `Turn the whole cube so the ${faceLabel} face is toward you. You'll insert the ${edgeLabel} into the middle layer between its centers.`,
  reorientAligned: (faceLabel: string, edgeLabel: string) =>
    `The ${edgeLabel} is on top and already lined up with its centers. Turn the whole cube so ${faceLabel} is toward you, then insert it between its centers.`,
  extract: (slot: string, algName: string) =>
    `The edge in ${slot} needs to come out. The ${algName} algorithm lifts it to the top layer without disturbing your bottom layer.`,
  insert: (edgeLabel: string, slot: string, algName: string) =>
    `Insert the ${edgeLabel} into ${slot} with the ${algName} algorithm. Your cross, corners, and any middle edges you've already placed stay intact.`,
  insertAligned: (edgeLabel: string, slot: string, algName: string) =>
    `The ${edgeLabel} is on top and lined up with its centers. Insert it into ${slot} with the ${algName} algorithm. Your cross, corners, and placed middle edges stay intact.`,
} as const;
