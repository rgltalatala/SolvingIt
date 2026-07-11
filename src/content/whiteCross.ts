import type { Color } from '../cube/cubeState';

export const whiteCrossLesson = {
  title: 'Lesson: White cross',
  subtitle: 'Build the white cross one edge at a time.',
  defaultStepTitle: 'White cross',
  progress: (solved: number) =>
    `Progress: ${solved}/4 cross edges in place (white on the bottom, side sticker matching its center).`,
  completeBody:
    "Nice work. You've got all four cross edges. When you're ready, move on to white corners.",
  continueWhiteCorners: 'Continue: White corners',
  sessionNotesSummary: 'Lesson session & reset',
  sessionNotes: [
    {
      label: 'Undo last example',
      text: "puts your virtual cube back to before the last apply. The next step title might change even though the cube matches an earlier point in the lesson. That's normal.",
    },
    {
      label: 'Re-scan cube',
      text: "opens the scanner so you can sync the virtual cube with your physical one. We'll figure out where you are and pick up from there.",
    },
    {
      label: 'Apply on my cube',
      text: 'updates your virtual cube and advances the lesson. Any y2 bookends are stored on the cube; the internal hold flag resets each apply.',
    },
    {
      label: 'Reset lesson tips',
      text: 'clears the one-time rotation tip and hold flag only. Your scramble stays as-is.',
    },
    {
      label: null,
      text: "Re-opening the lesson without starting fresh won't reset your cube or progress on it.",
    },
  ],
} as const;

export function whitePartnerEdgeHeading(partner: Color): string {
  return `White–${partner} edge`;
}

export const whiteCrossSteps = {
  intro: {
    title: 'How this lesson works',
    body: `The white cross is the foundation of every beginner solve, so it's worth taking your time here.

Start by finding an edge piece with a white sticker. Match its other color with the center of the same color, then turn that face to connect the edge with the white center on the bottom. Once both colors line up, that edge is solved.

Repeat the process for the other three white edges, being careful not to undo the ones you've already placed. There aren't many fixed cases to memorize here. This step is mostly about learning how the pieces move. The more cubes you solve, the more intuitive it becomes.`,
  },
  complete: {
    title: 'White cross complete',
    body: "You've got the full white cross. Each edge matches its center on the bottom. Line up your physical cube with the diagram (white on bottom, yellow on top), then head back to the overview when you're done.",
  },
  alignBfs: (partner: string) =>
    `Match the ${partner} sticker on this white–${partner} edge to the ${partner} center, then slot white on the bottom. The demo finds a path that won't knock out cross edges you've already solved.`,
  solveEdge: (partner: string) =>
    `Work this white–${partner} edge: line up its ${partner} sticker with the ${partner} center, then slot white on the bottom. The demo handles setup and keeps solved cross edges in place.`,
  stuck: (partner: string) =>
    `We couldn't build a safe demo for this white–${partner} edge from here. Match the side sticker to its center and slot white on the bottom yourself, or reset the scramble and try again.`,
  middleLayer: (partner: string) =>
    `This white–${partner} edge is in the middle layer. Line up its ${partner} sticker with the ${partner} center, then slot white on the bottom. The demo walks you through it without disturbing solved cross edges.`,
  uLayerAlign: (partner: string) =>
    `This white–${partner} edge is on the top layer. Match its ${partner} sticker to the ${partner} center, then slot white on the bottom. The demo includes any positioning you need first.`,
  uLayerInsert: (partner: string) =>
    `This white–${partner} edge already lines up with the ${partner} center on top. Slot it into the cross on the bottom. The demo shows the insert and any setup.`,
  dLayerRotate: (partner: string) =>
    `White is on the bottom for this white–${partner} edge, but it's not under the ${partner} center yet. Turn the bottom layer until the side sticker matches its center.`,
  dLayerInsert: (partner: string) =>
    `This white–${partner} edge lines up with the ${partner} center. Slot it on the bottom. The demo handles setup so your other cross edges stay put.`,
  directSolve: (partner: string) =>
    `This white–${partner} edge is ready to slot. Keep the ${partner} sticker matched to its center and put white on the bottom. The demo takes care of any setup.`,
} as const;
