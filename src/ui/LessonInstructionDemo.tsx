import type { Instruction } from '../learn/studentHold';
import { moveSequenceDemo } from '../content/tips';

export interface LessonInstructionDemoProps {
  instructions: Instruction[];
  /** Index of the move currently being shown (0 = first instruction). */
  activeIndex: number;
}

export function LessonInstructionDemo({
  instructions,
  activeIndex,
}: LessonInstructionDemoProps) {
  if (instructions.length === 0) return null;

  const clampedIndex = Math.min(
    Math.max(0, activeIndex),
    instructions.length - 1,
  );
  const current = instructions[clampedIndex];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {moveSequenceDemo.stepByStepHeading}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-slate-100">
        {current.text}
      </p>
      <ol className="mt-3 max-h-40 space-y-1.5 overflow-y-auto text-xs text-slate-400">
        {instructions.map((inst, i) => {
          const done = i < clampedIndex;
          const active = i === clampedIndex;
          const prefix = inst.type === 'rotation' ? '↻' : inst.move;
          return (
            <li
              key={`${prefix}-${i}`}
              className={
                done
                  ? 'text-emerald-600/90 line-through'
                  : active
                    ? 'font-medium text-amber-100'
                    : ''
              }
            >
              <span className="font-mono text-slate-500">{i + 1}.</span>{' '}
              {inst.text}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
