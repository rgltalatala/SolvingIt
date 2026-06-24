export const middleLayerLesson = {
  title: 'Lesson: Middle layer edges',
  defaultStepTitle: 'Middle layer edges',
  progress: (solved: number) =>
    `Progress: ${solved}/4 middle-layer edges in place (side stickers matching their centers).`,
  resetMiddleSession: 'Reset middle-layer session',
  goToWhiteCross: 'Go to white cross lesson',
  goToWhiteCorners: 'Go to white corners lesson',
  completeBody:
    "All four middle-layer edges are in. When you're ready, tackle the last layer, or head back to the cube overview.",
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
      label: 'Reset middle-layer session',
      text: "clears hold tracking and re-counts solved edges from the current cube. Your scramble doesn't change.",
    },
  ],
} as const;

export const middleLayerSteps = {
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
  insertAligned: 'Insert the aligned top-layer edge',
  insertEdge: 'Insert the edge',
  alignU: (colorA: string, colorB: string, partner: string) =>
    `The ${colorA}–${colorB} edge is on the top layer. Turn U until the ${partner} sticker lines up with the ${partner} center. Then you can turn the whole cube.`,
  reorient: (faceLabel: string, colorA: string, colorB: string) =>
    `Turn the whole cube so the ${faceLabel} face is toward you. You'll insert the ${colorA}–${colorB} edge into the middle layer between its centers.`,
  reorientAligned: (
    faceLabel: string,
    colorA: string,
    colorB: string,
  ) =>
    `The ${colorA}–${colorB} edge is on top and already lined up with its centers. Turn the whole cube so ${faceLabel} is toward you, then insert it between its centers.`,
  extract: (slotLabel: string, algName: string) =>
    `The edge in the ${slotLabel} middle slot needs to come out. The ${algName} algorithm lifts it to the top layer without disturbing your bottom layer.`,
  insert: (colorA: string, colorB: string, slotLabel: string, algName: string) =>
    `Insert the ${colorA}–${colorB} edge into the ${slotLabel} middle slot with the ${algName} algorithm. Your cross, corners, and any middle edges you've already placed stay intact.`,
  insertAligned: (
    colorA: string,
    colorB: string,
    slotLabel: string,
    algName: string,
  ) =>
    `The ${colorA}–${colorB} edge is on top and lined up with its centers. Insert it into the ${slotLabel} slot with the ${algName} algorithm. Your cross, corners, and placed middle edges stay intact.`,
} as const;
