import { Matrix4, Vector3 } from 'three';
import type { Color, CubeState, Face } from '../cube/cubeState';
import { FACE_ORDER } from '../cube/cubeState';
import { cubieDefinitions, getCubieFaceColors } from './cubeGeometry';

const AXIS_VECTOR = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1),
} as const;

const FACE_NORMAL: Record<Face, Vector3> = {
  U: new Vector3(0, 1, 0),
  D: new Vector3(0, -1, 0),
  F: new Vector3(0, 0, 1),
  B: new Vector3(0, 0, -1),
  R: new Vector3(1, 0, 0),
  L: new Vector3(-1, 0, 0),
};

const FACE_CENTER: Record<Face, Vector3> = {
  U: new Vector3(0, 1, 0),
  D: new Vector3(0, -1, 0),
  F: new Vector3(0, 0, 1),
  B: new Vector3(0, 0, -1),
  R: new Vector3(1, 0, 0),
  L: new Vector3(-1, 0, 0),
};

function snapCubiePosition(v: Vector3): [number, number, number] {
  return [
    Math.round(v.x),
    Math.round(v.y),
    Math.round(v.z),
  ] as [number, number, number];
}

/** Face-center colors visible after a whole-cube mesh rotation (pre-move sticker state). */
export function visualCentersAfterWholeCubeTurn(
  state: CubeState,
  axis: 'x' | 'y' | 'z',
  angle: number,
): Record<Face, Color> {
  const rotation = new Matrix4().makeRotationAxis(AXIS_VECTOR[axis], angle);
  const inverse = rotation.clone().invert();
  const centers = {} as Record<Face, Color>;

  for (const targetFace of FACE_ORDER) {
    const worldNormal = FACE_NORMAL[targetFace];
    const localCubiePos = FACE_CENTER[targetFace].clone().applyMatrix4(inverse);
    const position = snapCubiePosition(localCubiePos);
    const colors = getCubieFaceColors(state, position);
    const def = cubieDefinitions.find(
      (c) =>
        c.position[0] === position[0] &&
        c.position[1] === position[1] &&
        c.position[2] === position[2],
    );
    if (!def) continue;

    for (const stickerFace of def.exposedFaces) {
      const stickerWorldNormal = FACE_NORMAL[stickerFace]
        .clone()
        .applyMatrix4(rotation)
        .normalize();
      if (stickerWorldNormal.dot(worldNormal) > 0.99) {
        const color = colors[stickerFace];
        if (color && color !== 'unknown') {
          centers[targetFace] = color;
        }
      }
    }
  }

  return centers;
}
