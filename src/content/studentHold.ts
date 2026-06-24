/** Step-by-step move and rotation instructions for lesson demos. */

export const demoStepChips = {
  avoidBackStart: 'y2 · start',
  avoidBackReturn: 'y2 · return',
} as const;

export function rotationAvoidBackStart(): string {
  return "First, turn the whole cube halfway (y2) so the back face comes to the front. You won't need to turn B directly.";
}

export function rotationReturnToHold(frontColor: string): string {
  return `Turn the whole cube halfway (y2) again so ${frontColor} is on front. Back to your usual lesson hold.`;
}

export function rotationY2(): string {
  return 'Turn the whole cube halfway so the back face is toward you.';
}

export function rotationY(): string {
  return 'Turn the whole cube to the left so the right face is toward you.';
}

export function rotationYPrime(): string {
  return 'Turn the whole cube to the right so the left face is toward you.';
}

export function rotationFallback(rotation: string): string {
  return `Turn the whole cube (${rotation}).`;
}

export function moveHalf(
  color: string,
  position: string,
  face: string,
): string {
  return `Turn the ${color} (${position}) face 180° (${face}2).`;
}

export function moveCounterclockwise(
  color: string,
  position: string,
  face: string,
): string {
  return `Turn the ${color} (${position}) face counterclockwise (${face}′).`;
}

export function moveClockwise(
  color: string,
  position: string,
  face: string,
): string {
  return `Turn the ${color} (${position}) face clockwise (${face}).`;
}
