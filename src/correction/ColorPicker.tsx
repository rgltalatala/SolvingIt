import type { Color } from '../cube/cubeState';
import { colorHexMap } from '../cube/cubeColors';
import { correction as correctionCopy } from '../content/ui';

type ColorPickerLayout = 'row' | 'grid' | 'responsive';

interface ColorPickerProps {
  activeColor: Color | null;
  onSelect: (color: Color) => void;
  /**
   * `row` — horizontal wrap.
   * `grid` — compact 2×3.
   * `responsive` — 2×3 below `lg`, row at `lg+`.
   */
  layout?: ColorPickerLayout;
}

const colors: Color[] = ['white', 'yellow', 'green', 'blue', 'red', 'orange'];

/**
 * Same height as ManualFix face tabs (`h-8`). Prefer explicit height over an
 * invisible glyph to size empty swatches.
 */
const FACE_MATCHED_SWATCH =
  'box-border h-8 w-full rounded-md border';

const CONTAINER_CLASS: Record<ColorPickerLayout, string> = {
  grid: 'grid w-full grid-cols-2 gap-1.5',
  responsive:
    'grid w-full grid-cols-2 gap-1.5 lg:flex lg:w-auto lg:flex-wrap lg:gap-2',
  row: 'flex flex-wrap gap-2',
};

const SWATCH_CLASS: Record<ColorPickerLayout, string> = {
  responsive: `${FACE_MATCHED_SWATCH} lg:h-10 lg:w-10 lg:border-2`,
  grid: FACE_MATCHED_SWATCH,
  row: 'box-border h-10 w-10 rounded-md border-2',
};

const INACTIVE_BORDER_CLASS: Record<ColorPickerLayout, string> = {
  row: 'border-slate-400',
  grid: 'border-slate-500',
  responsive: 'border-slate-500 lg:border-slate-400',
};

export function ColorPicker({
  activeColor,
  onSelect,
  layout = 'row',
}: ColorPickerProps) {
  return (
    <div className={CONTAINER_CLASS[layout]}>
      {colors.map((color) => {
        const isActive = activeColor === color;
        const borderClass = isActive
          ? 'border-cyan-300'
          : INACTIVE_BORDER_CLASS[layout];

        return (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            className={`${SWATCH_CLASS[layout]} ${borderClass}`}
            style={{ backgroundColor: colorHexMap[color] }}
            aria-label={correctionCopy.selectColor(color)}
          />
        );
      })}
    </div>
  );
}
