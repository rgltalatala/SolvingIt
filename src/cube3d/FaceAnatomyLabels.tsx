import { Line, Text } from '@react-three/drei';
import type { Face } from '../cube/cubeState';

const LABEL_COLOR = '#ef4444';
const LABEL_COLOR_DIM = '#b91c1c';

type FaceLabelConfig = {
  face: Face;
  labelPosition: [number, number, number];
  linePoints?: [[number, number, number], [number, number, number]];
  rotation?: [number, number, number];
};

const FACE_CENTER = 1.55;
const CALLOUT_OFFSET = 2.35;
/** Outer sticker shell (cubie center ± half cubie size). */
const CUBE_SURFACE = 1 + 0.92 / 2;

const FACE_LABEL_CONFIG: FaceLabelConfig[] = [
  {
    face: 'U',
    labelPosition: [0, FACE_CENTER, 0],
    rotation: [-Math.PI / 2, 0, 0],
  },
  {
    face: 'F',
    labelPosition: [0, 0, FACE_CENTER],
  },
  {
    face: 'R',
    labelPosition: [FACE_CENTER, 0, 0],
    rotation: [0, Math.PI / 2, 0],
  },
  {
    face: 'L',
    labelPosition: [-2.05, 0.2, 2.05],
    linePoints: [
      [-1.8, 0.2, 1.95],
      [-CUBE_SURFACE, 0.15, CUBE_SURFACE * 0.9],
    ],
  },
  {
    face: 'D',
    labelPosition: [0.15, -2.05, 2.05],
    linePoints: [
      [0.15, -1.8, 1.95],
      [0.15, -CUBE_SURFACE, CUBE_SURFACE * 0.9],
    ],
  },
  {
    face: 'B',
    labelPosition: [CALLOUT_OFFSET * 0.55, 0.2, -CALLOUT_OFFSET],
    linePoints: [
      [CALLOUT_OFFSET * 0.45, 0.15, -CALLOUT_OFFSET + 0.35],
      [0.3, 0.15, -CUBE_SURFACE],
    ],
  },
];

type FaceAnatomyLabelsProps = {
  highlightedFace: Face | null;
};

export function FaceAnatomyLabels({ highlightedFace }: FaceAnatomyLabelsProps) {
  return (
    <group>
      {FACE_LABEL_CONFIG.map(
        ({ face, labelPosition, linePoints, rotation }) => {
          const isHighlighted =
            highlightedFace === null || highlightedFace === face;
          const color = isHighlighted ? LABEL_COLOR : LABEL_COLOR_DIM;
          const fontSize = highlightedFace === face ? 1.05 : 0.85;
          const lineWidth = highlightedFace === face ? 3 : 1.5;

          return (
            <group key={face}>
              {linePoints ? (
                <Line
                  points={linePoints}
                  color={color}
                  lineWidth={lineWidth}
                  transparent
                  opacity={isHighlighted ? 1 : 0.55}
                />
              ) : null}
              <Text
                position={labelPosition}
                rotation={rotation ?? [0, 0, 0]}
                fontSize={fontSize}
                color={color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#111827"
                fillOpacity={isHighlighted ? 1 : 0.55}
                renderOrder={11}
              >
                {face}
              </Text>
            </group>
          );
        },
      )}
    </group>
  );
}
