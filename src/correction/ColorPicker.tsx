import type { Color } from '../cube/cubeState';
import { colorHexMap } from '../cube/cubeColors';
import { correction as correctionCopy } from '../content/ui';

interface ColorPickerProps {
  activeColor: Color | null;
  onSelect: (color: Color) => void;
}

const colors: Color[] = ['white', 'yellow', 'green', 'blue', 'red', 'orange'];

export function ColorPicker({ activeColor, onSelect }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {colors.map((color) => {
        const isActive = activeColor === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            className={`h-10 w-10 rounded-md border-2 ${isActive ? 'border-cyan-300' : 'border-slate-400'}`}
            style={{ backgroundColor: colorHexMap[color] }}
            aria-label={correctionCopy.selectColor(color)}
          />
        );
      })}
    </div>
  );
}
