import type { Color } from '../cube/cubeState';
import { formatColorLabel } from '../cube/cubeState';

export const whiteCrossLesson = {
  title: 'Lesson: White cross',
  defaultStepTitle: 'White cross',
  progress: (solved: number) =>
    `Progress: ${solved}/4 cross edges in place (white on the bottom, side sticker matching its center).`,
  completeBody:
    "Nice work. You've got all four cross edges. When you're ready, move on to white corners, or head back to the cube overview.",
  continueWhiteCorners: 'Continue: White corners',
  sessionNotesSummary: 'Lesson session & reset',
  sessionNotes: [
    {
      label: 'Undo last example',
      text: "puts your virtual cube back to before the last apply. The next step title might change even though the cube matches an earlier point in the lesson. That's normal.",
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
      label: 'Start lesson',
      text: 'from the cube overview runs the same session reset before opening this view.',
    },
    {
      label: null,
      text: "Re-opening the lesson without starting fresh won't reset your cube or progress on it.",
    },
  ],
} as const;

export function whitePartnerEdgeHeading(partner: Color): string {
  return `White–${formatColorLabel(partner)} edge`;
}

export const whiteCrossSteps = {
  intro: {
    title: 'How this lesson works',
    body: `Look for edge pieces with a white sticker. For each one, match its partner color to the matching center on the side of the cube. Then turn that face to connect the edge to the white center on the bottom. That's a solved cross edge.

Repeat for the other three edges while keeping the ones you've already solved in place. This step is mostly intuitive. There aren't as many named cases as later lessons, but this step gets easier the more you practice it.`,
  },
  complete: {
    title: 'White cross complete',
    body: "You've got the full white cross. Each edge matches its center on the bottom. Line up your physical cube with the diagram (white on bottom, yellow on top), then head back to the overview when you're done.",
  },
  alignBfs: (partner: string) =>
    `Match the ${partner} sticker on this white–${partner} edge to the ${partner} center before slotting white on the bottom. The demo is the shortest path we found that keeps your other cross edges in place.`,
  solveEdge: (partner: string, extraNote: string) =>
    `Work this white–${partner} edge: line up its ${partner} sticker with the ${partner} center, then slot white on the bottom.${extraNote} The demo handles setup, alignment, slotting, and undo so edges you've already solved stay put.`,
  solveEdgeBfsTopLayerNote:
    'This piece is on the top layer with white on a side. We still connect it to the center and slot it rather than only parking white on U.',
  stuck: (partner: string) =>
    `We couldn't find a short demo for this white–${partner} edge from here without disturbing your other cross edges. Line up the colored sticker with the ${partner} center on your own, then slot white on the bottom. Or reset the scramble and try again.`,
  middleLayerAlign: (partner: string, face: string, turnWord: string) =>
    `This white–${partner} edge is in the middle layer. One ${face} turn (${turnWord}) lines up the ${partner} sticker with the ${partner} center. Then you can slot white on the bottom.`,
  middleLayerAlignNotLinedUp: (
    partner: string,
    face: string,
    turnWord: string,
  ) =>
    `This white–${partner} edge is in the middle layer but isn't lined up with the ${partner} center yet. One ${face} turn (${turnWord}) connects the colored sticker to its center without undoing cross edges you've already placed.`,
  uLayerConnect: (
    partner: string,
    turnWord: string,
    lastFace: string,
  ) =>
    `This white–${partner} edge is on the top layer. Line up its ${partner} sticker with the ${partner} center. A ${lastFace} turn (${turnWord}) or a U turn to position it works before slotting white on the bottom.`,
  uLayerSlot: (partner: string, face: string) =>
    `The white–${partner} edge is lined up with the ${partner} center on top. Slot it into the cross with ${face}2 (the demo may include U setup). Setup and undo keep your other cross edges safe.`,
  dLayerRotate: (partner: string, spin: string) =>
    `White is already on the bottom for this white–${partner} edge, but it's not under the ${partner} center yet. Turn the bottom layer (${spin}) until the colored sticker lines up with the ${partner} center. That's the cross edge done.`,
  dLayerInsert: (partner: string, face: string) =>
    `The white–${partner} edge is connected to the ${partner} center. Slot it on the bottom (the demo may spin D, then use ${face}2). Setup moves might shuffle other cross edges briefly; undo at the end puts them back.`,
  directSolve: (partner: string) =>
    `The white–${partner} edge is lined up with the ${partner} center. Slot it on the bottom. Setup moves might move other cross edges temporarily. Undo at the end restores them.`,
} as const;
