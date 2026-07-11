import { formatColorLabel, type Color } from '../cube/cubeState';

/**
 * Piece identity vs position:
 * - Identity = sticker colors (White–Blue Edge). Never changes with location.
 * - Position = face-letter slot (UF, FRD, URF). Where a piece is or should go.
 *
 * Lesson copy should name cubies by identity and locations by position codes.
 */

export function whiteEdgeIdentity(partner: Color): string {
  return `White–${formatColorLabel(partner)} Edge`;
}

export function edgeIdentity(colorA: Color, colorB: Color): string {
  return `${formatColorLabel(colorA)}–${formatColorLabel(colorB)} Edge`;
}

export function whiteCornerIdentity(sideA: Color, sideB: Color): string {
  return `White–${formatColorLabel(sideA)}–${formatColorLabel(sideB)} Corner`;
}

export function yellowCornerIdentity(sideA: Color, sideB: Color): string {
  return `Yellow–${formatColorLabel(sideA)}–${formatColorLabel(sideB)} Corner`;
}

/** Compact progress labels (no Edge/Corner suffix). */
export function whiteEdgeProgressLabel(partner: Color): string {
  return `White–${formatColorLabel(partner)}`;
}

export function edgeProgressLabel(colorA: Color, colorB: Color): string {
  return `${formatColorLabel(colorA)}–${formatColorLabel(colorB)}`;
}

export function whiteCornerProgressLabel(sideA: Color, sideB: Color): string {
  return `White–${formatColorLabel(sideA)}–${formatColorLabel(sideB)}`;
}

export function yellowCornerProgressLabel(sideA: Color, sideB: Color): string {
  return `Yellow–${formatColorLabel(sideA)}–${formatColorLabel(sideB)}`;
}

export function yellowEdgeIdentity(partner: Color): string {
  return `Yellow–${formatColorLabel(partner)} Edge`;
}

export function yellowEdgeProgressLabel(partner: Color): string {
  return `Yellow–${formatColorLabel(partner)}`;
}
