/** UI labels, buttons, page chrome, validation, and scanner overlay copy. */

export const ui = {
  back: 'Back',
  continue: 'Continue',
  confirm: 'Confirm',
  capture: 'Capture',
  rescan: 'Re-scan',
  reset: 'Reset',
  undoLastExample: 'Undo last example',
  backToCubeOverview: 'Back to cube overview',
  resetLessonTips: 'Reset lesson tips',
  applyExampleContinue: 'Apply on my cube & continue',
  revalidateCube: 'Re-validate cube',
} as const;

export const lessonUnavailable = {
  title: 'Lesson unavailable',
  body: 'Scan and validate your cube first, then come back to start a lesson.',
} as const;

export const cubeOverview = {
  notReadyTitle: 'Cube not ready',
  notReadyBody:
    'Scan and confirm all six faces first. We need a full picture before we can build your virtual cube.',
  readyTitle: 'Cube ready',
  readyBody:
    'Your virtual cube matches your scanned scramble. Drag to rotate and take a look around.',
  startLessonWhiteCross: 'Start lesson: White cross',
  startLessonWhiteCorners: 'Start lesson: White corners',
  startLessonMiddleLayer: 'Start lesson: Middle layer edges',
  startLessonLastLayer: 'Start lesson: Last layer',
  faceletStringLabel: 'Facelet string (URFDLB):',
} as const;

export const practiceBar = {
  generating: 'Generating scramble…',
  button: 'Practice: random scramble → lesson',
  lastScrambleTitle:
    'Last scramble applied (storage orientation, face-turn only)',
  lastScramble: (alg: string) => `Last scramble: ${alg}`,
} as const;

export const scanView = {
  title: "Rubik's Cube Scanner",
  validationFailed: "Something's off with this scan.",
  livePreviewHeading: 'Live virtual cube preview',
  livePreviewNote:
    "Gray stickers haven't been scanned yet. Confirm each face and they'll fill in here in real time.",
  rescanFace: (face: string) => `Re-scan ${face} face`,
} as const;

export const scannerOverlay = {
  lightingTip:
    'Bright, even light works best. Try to stay out of direct sunlight.',
  startingCamera: 'Starting camera…',
} as const;

export const cameraErrors = {
  NotAllowedError:
    "Camera access was blocked. Allow camera permission in your browser settings and try again.",
  NotFoundError: "We couldn't find a camera on this device.",
  NotReadableError:
    'The camera looks busy. Close any other app using it and try again.',
  OverconstrainedError:
    "This device's camera doesn't support the settings we need.",
  fallback: "Couldn't access the camera.",
} as const;

export const correction = {
  reviewFace: (face: string) => `Review ${face} face`,
  tapSticker: 'Tap a sticker, pick a color, then confirm.',
  centerLocked: (color: string) =>
    `The center stays locked to ${color}. Centers never move on a real cube.`,
  centerMustBe: (color: string) =>
    `The center has to be ${color}. Re-scan this face and we'll try again.`,
  selectColor: (color: string) => `Select ${color}`,
  stickerLocked: (n: number) => `Sticker ${n} (locked)`,
} as const;

export const manualFix = {
  title: 'Fix validation errors',
  subtitle:
    "The scan didn't pass validation. Adjust stickers below, then re-validate. Centers stay locked.",
  faceletStringLabel:
    'Current URFDLB facelet string (what the validator sees):',
  centerLocked: (color: string) => `Center sticker is locked to ${color}.`,
  previewHeading: 'Manual fix preview',
} as const;

export const validation = {
  colorNames: {
    white: 'White',
    yellow: 'Yellow',
    green: 'Green',
    blue: 'Blue',
    red: 'Red',
    orange: 'Orange',
  } as const,
  duplicateCorners:
    "These corner stickers don't match any real cube. Check where three faces meet.",
  duplicateEdges:
    "An edge piece is duplicated or missing. Adjust stickers on the two faces that share that edge.",
  cornerTwist:
    "Corner twists don't add up to a solvable cube. Re-check corner stickers where three faces meet.",
  edgeFlip:
    "Edge flips don't add up to a solvable cube. Re-check edge stickers on the two faces that share that edge.",
  parity:
    "Corner and edge parity don't match. This is common when you've only fixed one face. Adjust at least one pair of stickers on connected faces.",
  parseError: "We couldn't read this cube layout.",
  colorCount: (color: string, count: number) =>
    `We're only seeing ${count} ${color.toLowerCase()} stickers. Double-check your ${color.toLowerCase()} face. One sticker may be misread.`,
  duplicateCenters:
    'Each face center should be a different color. Re-scan the face with the wrong center.',
  centerMismatch: (face: string, actual: string, expected: string) =>
    `The ${face} center is ${actual}, but it should be ${expected}. Re-scan that face.`,
  parseErrorWithDetail: (detail: string) =>
    `We couldn't read this cube layout. (${detail})`,
} as const;
