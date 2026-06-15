import type { FaceState } from '../cube/cubeState';

interface CubeFaceProps {
  faceState: FaceState;
}

export function CubeFace({ faceState }: CubeFaceProps) {
  return (
    <div className="text-xs text-slate-400">
      CubeFace stub ({faceState.length} stickers)
    </div>
  );
}
