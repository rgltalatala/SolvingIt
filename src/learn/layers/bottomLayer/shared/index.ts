export {
  colorStickerOnU,
  cornerWhiteStickerOnD,
  edgeAlignedToSideCenter,
  faceForColorOnEdge,
  faceForWhiteOnCorner,
  faceForWhiteOnEdge,
  findCornerWithColors,
  findEdgeWithColors,
  isMiddleLayerEdge,
  whiteStickerOnD,
  whiteStickerOnU,
} from './pieceQueries';

export { isWhiteCrossComplete } from '../cross/crossSlotModel';
import type { Color } from '../../../../cube/cubeState';

/** Lowercase color name for piece references in lesson step copy. */
export function formatColor(color: Color): string {
  return color;
}
