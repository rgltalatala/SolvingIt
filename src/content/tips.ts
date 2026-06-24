/** Cross-lesson coaching copy shared by multiple views and step builders. */

export const PHYSICAL_CUBE_MATCH_NOTE =
  'Before you apply this on your cube, line it up with the diagram below. Same scramble, white on bottom, yellow on top.';

export const FACE_BLUE_TITLE = 'Face the blue side';

export const FACE_BLUE_BODY =
  'Turn the cube so blue is toward you again. White on bottom, yellow on top, same hold you started with.';

export const HOLD_WHITE_BOTTOM =
  'Hold the cube with white on the bottom and yellow on top';

export const SAME_HOLD_NOTE = (fColor: string, uColor: string, dColor: string) =>
  `Same hold as the diagram: ${fColor} on F (front), ${uColor} on U (top), ${dColor} on D (bottom).`;

export const REORIENT_HOLD_NOTE =
  "After you've turned the cube in your hands to match, hit Continue. The virtual scramble stays the same.";

export const lessonAvoidBack = {
  heading: 'Skip the back face for this example',
  description: (frontColor: string, holdNote: string) =>
    `This example uses a B turn. Turning a side that's opposite from where you're facing may be difficult to do when first starting out, so we can rotate the cube so that the B face is now the F face. Turn on the preference and we'll bookend the demo with y2. Start with a half turn so you're facing the front instead of B, run the moves, then y2 again so ${frontColor} is on front${holdNote}. We always rotate back to the face we were initially facing so we don't lose our place.`,
  on: 'Avoid back moves: On',
  off: 'Avoid back moves: Off',
  rememberDefault:
    'Always avoid back moves when an example uses B (saved in this browser)',
  rotationTip: (frontColor: string) =>
    `The preview starts and ends with y2 so you land back in the same hold (${frontColor} on front). Step through the full sequence on your cube before moving on.`,
  gotIt: 'Got it',
  usualLessonHold: ' (usual lesson hold)',
} as const;

export const applyHints = {
  default:
    "When your cube matches the diagram and you've stepped through the example, apply here to update the virtual cube and keep going.",
  reorient:
    "When your cube matches the hold shown, continue to the next step.",
  solve:
    "When your cube matches the diagram and you've worked through the example, apply here to update the virtual cube and continue.",
} as const;

export const preparing = {
  lesson: 'Preparing lesson…',
  nextExample: 'Preparing next example…',
  defaultSubtitle: 'Finding a short demo for this cube…',
} as const;

export const moveSequenceDemo = {
  exampleHeading: 'Example move sequence',
  interactiveHeading: 'Interactive preview',
  noMovesSummary:
    "Step through the moves once this lesson step includes an example algorithm.",
  undoing: (move: string) => `Undoing: ${move}`,
  animating: (move: string) => `Animating: ${move}`,
  startPosition: 'Start position',
  complete: (moves: string) => `Complete: ${moves}`,
  applied: (moves: string) => `Applied: ${moves}`,
  reset: 'Reset',
  previousMove: 'Previous move',
  nextMove: 'Next move',
  playing: 'Playing…',
  playAll: 'Play all',
  wholeCubeRotationTitle: 'Whole-cube rotation',
  stepByStepHeading: 'Step-by-step instructions',
  holdBeforeExample: (fColor: string, uColor: string, dColor: string) =>
    `The diagram matches your cube before this example. Face letters follow this hold: F = ${fColor} (front), U = ${uColor}, D = ${dColor}. Layer turns animate on Next / Play all; Previous animates the undo.`,
  holdDuringOrAfter: (
    timing: string,
    fColor: string,
    uColor: string,
    dColor: string,
  ) =>
    `Hold labels match the diagram ${timing}: F = ${fColor} (front), U = ${uColor}, D = ${dColor}.`,
  holdTimingAnimating: 'during the current turn',
  holdTimingAfter: 'after the moves applied so far',
  noAlgorithmYet:
    "This step doesn't have an example algorithm yet. The preview matches your current cube; Reset, Next, and Play all show up on steps that include one.",
} as const;

export const demoStepChips = {
  avoidBackStart: 'y2 · start',
  avoidBackReturn: 'y2 · return',
} as const;
