import type { Face } from '../cube/cubeState';

const mirroredPreviewNote =
  "On a phone camera, left and right may look swapped. That's normal.";

export const notationIntro = {
  title: 'Cube notation & anatomy',
  subtitle:
    "Before you scan your cube, let's cover how moves are written. It'll make every lesson step clearer.",
  openNotation: 'Explore notation',
  dontShowAgain: "Don't show this again when starting a new lesson",
  continueToScan: 'Continue to scan',
} as const;

export const faceInstructions: Record<Face, string> = {
  U: `Scan the WHITE face: white toward the camera, green on top, blue on bottom, red on the right, orange on the left. ${mirroredPreviewNote}`,
  D: `Scan the YELLOW face: yellow toward the camera, green on top, blue on bottom, orange on the right, red on the left. ${mirroredPreviewNote}`,
  F: `Scan the GREEN face: green toward the camera, white on top, yellow on bottom, orange on the right, red on the left. ${mirroredPreviewNote}`,
  B: `Scan the BLUE face: blue toward the camera, white on top, yellow on bottom, red on the right, orange on the left. ${mirroredPreviewNote}`,
  R: `Scan the RED face: red toward the camera, white on top, yellow on bottom, green on the right, blue on the left. ${mirroredPreviewNote}`,
  L: `Scan the ORANGE face: orange toward the camera, white on top, yellow on bottom, blue on the right, green on the left. ${mirroredPreviewNote}`,
};
