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
    <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-700 p-1">
      {faceState.map((color, index) => {
        const isLocked = lockedIndexes.includes(index);
        return (
          <button
            key={index}
            type="button"
            className={`h-16 w-16 rounded-sm border-2 ${selectedIndex === index ? 'border-cyan-300' : 'border-transparent'} ${isLocked ? 'opacity-80' : ''}`}
            style={{ backgroundColor: colorHexMap[color] }}
            disabled={isLocked}
            onClick={() => handleCellClick(index)}
            aria-label={`Sticker ${index + 1}${isLocked ? ' (locked)' : ''}`}
          />
        );
      })}
    </div>
  );
}
