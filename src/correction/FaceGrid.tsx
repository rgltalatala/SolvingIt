import type { Color, FaceState } from '../cube/cubeState';
import { colorHexMap } from '../cube/cubeColors';

interface FaceGridProps {
  faceState: FaceState;
  selectedIndex: number | null;
  activeColor: Color | null;
  lockedIndexes?: number[];
  onSelectIndex: (index: number) => void;
  onUpdate: (nextFace: FaceState) => void;
}

export function FaceGrid({
  faceState,
  selectedIndex,
  activeColor,
  lockedIndexes = [],
  onSelectIndex,
  onUpdate,
}: FaceGridProps) {
  const handleCellClick = (index: number) => {
    if (lockedIndexes.includes(index)) return;
    onSelectIndex(index);
    if (activeColor) {
      const next = [...faceState] as FaceState;
      next[index] = activeColor;
      onUpdate(next);
    }
  };

  return (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden p-3">
      {/*
        @container-[size] enables both cqw and cqh (plain @container is inline-size only).
        Side length = min(available width, available height).
      */}
      <div className="@container-[size] flex size-full items-center justify-center">
        <div className="box-border grid aspect-square w-[min(100cqw,100cqh)] max-h-full grid-cols-3 grid-rows-3 gap-1 rounded-md border border-slate-600 bg-slate-800 p-1">
          {faceState.map((color, index) => {
            const isLocked = lockedIndexes.includes(index);
            return (
              <button
                key={index}
                type="button"
                className={`box-border size-full min-h-0 min-w-0 rounded-sm border-2 ${selectedIndex === index ? 'border-cyan-300' : 'border-transparent'} ${isLocked ? 'opacity-80' : ''}`}
                style={{ backgroundColor: colorHexMap[color] }}
                disabled={isLocked}
                onClick={() => handleCellClick(index)}
                aria-label={`Sticker ${index + 1}${isLocked ? ' (locked)' : ''}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
