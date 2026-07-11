import type { Color } from '../../cube/cubeState';
import { colorHexMap } from '../../cube/cubeColors';

export type LessonProgressSlot = {
  key: string;
  label: string;
  solved: boolean;
  /**
   * All sticker colors on this piece (edge: 2, corner: 3), in identity order.
   * Shown as equal stripes when solved or current.
   */
  colors?: readonly Color[];
  /** Lesson's current target slot (border highlight when still unsolved). */
  isCurrent?: boolean;
};

export type LessonProgressConfig = {
  solved: number;
  total: number;
  /** Per-slot solved state; preferred over sequential slotLabels. */
  slots?: LessonProgressSlot[];
  slotLabels?: string[];
  ariaLabel: string;
  phaseLabel?: string;
};

type LessonProgressProps = {
  progress: LessonProgressConfig;
};

function pieceColors(slot: LessonProgressSlot): readonly Color[] {
  if (slot.colors && slot.colors.length > 0) return slot.colors;
  if (slot.color) return [slot.color];
  return [];
}

function segmentClassName(slot: LessonProgressSlot): string {
  const base = 'flex h-2 flex-1 overflow-hidden rounded-full transition-colors';
  if (slot.solved) {
    return base;
  }
  if (slot.isCurrent) {
    return `${base} bg-slate-700 ring-2 ring-inset ring-violet-400`;
  }
  return `${base} bg-slate-700`;
}

function labelClassName(slot: LessonProgressSlot): string {
  const base = 'flex-1 truncate text-center text-[9px] font-medium leading-tight';
  if (slot.solved) {
    return `${base} text-emerald-400`;
  }
  return `${base} text-slate-500`;
}

function ProgressSegment({ slot }: { slot: LessonProgressSlot }) {
  const colors = pieceColors(slot);

  if (slot.solved && colors.length > 0) {
    return (
      <div title={slot.label} className={segmentClassName(slot)}>
        {colors.map((color, index) => (
          <div
            key={`${slot.key}-${color}-${index}`}
            className="h-full"
            style={{
              backgroundColor: colorHexMap[color],
              width: `${100 / colors.length}%`,
            }}
          />
        ))}
      </div>
    );
  }

  return <div title={slot.label} className={segmentClassName(slot)} />;
}

export function LessonProgress({ progress }: LessonProgressProps) {
  const { solved, total, slots, slotLabels, ariaLabel, phaseLabel } = progress;

  const useSlotMode = slots !== undefined && slots.length > 0;
  const legacySlots =
    slotLabels ?? Array.from({ length: total }, (_, i) => `${i + 1}`);

  return (
    <div className="mt-3 flex flex-col gap-2" aria-label={ariaLabel}>
      {phaseLabel ? (
        <p className="text-xs font-medium text-violet-300">{phaseLabel}</p>
      ) : null}
      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div
            className="flex h-2 gap-1.5"
            role="progressbar"
            aria-valuenow={solved}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={ariaLabel}
          >
            {useSlotMode
              ? slots.map((slot) => <ProgressSegment key={slot.key} slot={slot} />)
              : legacySlots.map((label, index) => {
                  const done = index < solved;
                  const active = index === solved;
                  return (
                    <div
                      key={`${label}-${index}`}
                      title={label}
                      className={`flex h-2 flex-1 rounded-full transition-colors ${
                        done
                          ? 'bg-emerald-600'
                          : active
                            ? 'bg-slate-700 ring-2 ring-inset ring-violet-400'
                            : 'bg-slate-700'
                      }`}
                    />
                  );
                })}
          </div>
          {useSlotMode ? (
            <div className="flex gap-1.5">
              {slots.map((slot) => (
                <span key={slot.key} className={labelClassName(slot)}>
                  {slot.label}
                </span>
              ))}
            </div>
          ) : slotLabels ? (
            <div className="flex gap-1.5">
              {slotLabels.map((label, index) => {
                const done = index < solved;
                return (
                  <span
                    key={label}
                    className={`flex-1 truncate text-center text-[10px] font-mono ${
                      done ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
        <div className="flex h-2 shrink-0 items-center self-start">
          <span className="text-sm tabular-nums text-slate-400">
            {solved} / {total}
          </span>
        </div>
      </div>
    </div>
  );
}
