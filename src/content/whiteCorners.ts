import type { CornerSlotId } from '../learn/layers/bottomLayer/corners/types';

export const CORNER_LABELS: Record<CornerSlotId, string> = {
  FRD: 'Front–right corner',
  BDR: 'Back–right corner',
  BLD: 'Back–left corner',
  FDL: 'Front–left corner',
};

export function formatCornerLabel(id: CornerSlotId): string {
  return CORNER_LABELS[id];
}

export const whiteCornersLesson = {
  title: 'Lesson: White corners',
  defaultStepTitle: 'White corners',
  progress: (solved: number) =>
    `Progress: ${solved}/4 white corners in place (white on D, side stickers matching their centers).`,
  resetCornerSession: 'Reset corner session',
  goToWhiteCross: 'Go to white cross lesson',
  completeBody:
    "All four white corners are in. When you're ready, move on to middle-layer edges, or head back to the cube overview.",
  continueMiddleLayer: 'Continue: Middle layer edges',
  preparingSubtitle: 'Finding a short demo for this corner…',
  sessionNotesSummary: 'Lesson session & reset',
  sessionNotes: [
    {
      label: 'Reorient steps',
      text: 'rotate the virtual cube (whole-cube y turns) so the next corner faces you.',
    },
    {
      label: 'Undo last example',
      text: 'puts the virtual cube back before the last apply. That includes corner demo or reorient.',
    },
    {
      label: 'Reset corner session',
      text: "clears hold tracking and re-counts solved corners from the current cube. Your scramble doesn't change.",
    },
  ],
} as const;

export const whiteCornersSteps = {
  intro: {
    title: 'How this lesson works',
    body: `For every white corner, we'll use the same target position: the front-right-bottom corner (FRD). Keeping the target in one place means you only need to learn one set of cases.

If the corner isn't already ready to insert, we'll first move it to the top layer at the front-right position (URF). From there, you'll use the algorithm that matches your case to insert it into FRD.

Once a corner is solved, simply rotate the entire cube so the next unsolved corner becomes your new target. You'll repeat the same process until the whole white face is complete.`,
  },
  complete: {
    title: 'White corners complete',
    body: "All four white corners are home. White on D, side colors matching their centers. Hold blue toward you (white on bottom, yellow on top) and check that your cube matches the diagram.",
  },
  prerequisite: {
    title: 'Finish the white cross first',
    body: "You'll need all four white edges on the bottom, each matching its center, before corners make sense. Head to the white cross lesson, then come back here.",
  },
  faceBlue: {
    title: 'Face the blue side',
    body: "Corners are done. Turn the cube so blue is toward you again. White on bottom, yellow on top, same as when you started.",
  },
  faceSideTitle: (faceLabel: string) => `Face the ${faceLabel.toLowerCase()} side`,
  reorient: (faceLabel: string, cornerLabel: string, skipNote: string) =>
    `Turn the whole cube so the ${faceLabel} face is toward you (white stays on bottom, yellow on top). You'll slot the ${cornerLabel} into the front-right position.${skipNote}`,
  reorientSkipTwoSteps:
    ' The next corner is in the back right of the top layer. A U2 will orient it to the front right.',
  reorientSkipThreeSteps:
    ' The next corner is in the front left of the top layer. A U\' turn does it.',
  placeholder: (colorA: string, colorB: string) =>
    `Slot the white–${colorA}–${colorB} corner: white on D, ${colorA} and ${colorB} matching their centers. Line the piece up with its centers on your own, or reset the scramble and try again.`,
  twisted: (corner: string, color: string, face: string) =>
    `The ${corner.toLowerCase()} is in the front-right slot but twisted. White is on ${color} (${face}) instead of the bottom. The demo orients white onto D without disturbing your cross or corners you've already solved.`,
  wrongDSlot: (corner: string) =>
    `The ${corner.toLowerCase()} is in the wrong bottom corner. The demo lifts it to the top (URF), then inserts it with white on the bottom. Your cross and solved corners stay put.`,
  directSolve: (corner: string) =>
    `Slot the ${corner.toLowerCase()} using the demo. Your white cross and any corners you've already solved stay intact.`,
  uLayerBase: (corner: string) =>
    `The ${corner.toLowerCase()} is on the top layer. The demo lines it up above the front-right slot (URF), then inserts it with white on the bottom. Your cross and solved corners stay put.`,
  uLayerAlignInsertNote:
    "Some U turns might look redundant, like U then U'. That's on purpose: always get the piece above URF, read the case from how white is facing, then run the matching insert. Once you feel comfortable with the demo, you can skip the U turns and just run the insert.",
} as const;
