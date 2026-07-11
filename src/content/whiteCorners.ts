import type { Color } from '../cube/cubeState';
import { whiteCornerIdentity } from './pieceIdentity';

export { whiteCornerIdentity };

export const whiteCornersLesson = {
  title: 'Lesson: White corners',
  subtitle: 'Solve every white corner into FRD.',
  defaultStepTitle: 'White corners',
  progress: (solved: number) =>
    `Progress: ${solved}/4 white corners in place (white on D, side stickers matching their centers).`,
  resetCornerSession: 'Reset corner session',
  goToWhiteCross: 'Go to white cross lesson',
  completeBody:
    "All four white corners are in. When you're ready, move on to middle-layer edges.",
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
      label: 'Re-scan cube',
      text: "opens the scanner so you can sync the virtual cube with your physical one. We'll figure out where you are and pick up from there.",
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
    body: `Each white corner has a permanent identity from its stickers, like the White–Blue–Red Corner. We'll always insert into the same target position: FRD.

If the corner isn't already ready to insert, we'll first bring it to URF on the top layer. From there, you'll use the algorithm that matches your case to insert it into FRD.

Once a corner is solved, rotate the entire cube so the next unsolved corner's home slot becomes FRD. Repeat until every white corner is solved.`,
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
  faceSideTitle: (faceLabel: string) => `Face the ${faceLabel} side`,
  reorient: (faceLabel: string, cornerLabel: string, skipNote: string) =>
    `Turn the whole cube so ${faceLabel} is toward you. White stays on bottom, yellow on top. You're setting up to solve the ${cornerLabel}.${skipNote}`,
  reorientSkipAlignNote:
    " The next piece is on the top layer; we'll line it up at URF before inserting into FRD.",
  placeholder: (corner: string) =>
    `Slot the ${corner}: white on the bottom, side colors matching their centers. Line it up on your own, or reset the scramble and try again.`,
  twisted: (corner: string) =>
    `The ${corner} is in FRD but twisted. The demo orients white onto the bottom without disturbing your cross or corners you've already placed.`,
  wrongDSlot: (corner: string) =>
    `The ${corner} is in the wrong bottom slot. The demo lifts it to the top layer, brings it to URF, then runs the matching insert into FRD. Your cross and solved corners stay put.`,
  directSolve: (corner: string) =>
    `Slot the ${corner} into FRD with the demo. Your white cross and any corners you've already solved stay put.`,
  uLayer: (corner: string) =>
    `The ${corner} is on the top layer. The demo brings it to URF and inserts it into FRD with white on the bottom, without touching your cross or solved corners.`,
  uLayerAlignHabitNote:
    "Some U turns might look redundant, like U then U' or U2 then U. That's on purpose. We're building the habit of lining up every top-layer corner at URF before you insert into FRD. Check how white is facing, then run the matching insert. Once you're comfortable, skip the extra U turns and go straight to the insert.",
} as const;
