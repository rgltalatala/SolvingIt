import type { Instruction } from '../../learn/studentHold';
import { lessonLayout } from '../../content/tips';

type LessonCurrentInstructionProps = {
  instructions: Instruction[];
  activeIndex: number;
};

function instructionMoveLabel(inst: Instruction): string {
  if (inst.label) return inst.label;
  if (inst.type === 'rotation') return inst.rotation;
  return inst.move;
}

export function LessonCurrentInstruction({
  instructions,
  activeIndex,
}: LessonCurrentInstructionProps) {
  if (instructions.length === 0) return null;

  const clampedIndex = Math.min(
    Math.max(0, activeIndex),
    instructions.length - 1,
  );
  const current = instructions[clampedIndex];
  const moveLabel = instructionMoveLabel(current);

  return (
    <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/80">
        Step {clampedIndex + 1} of {instructions.length}
      </p>
      <p className="mt-2 text-lg font-medium leading-snug text-slate-100">
        {current.text}
      </p>
      <p className="mt-3 font-mono text-2xl font-bold text-amber-100">
        [{moveLabel}]
      </p>
      {instructions.length > 1 ? (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">
            {lessonLayout.seeAllSteps}
          </summary>
          <ol className="mt-2 max-h-40 space-y-1.5 overflow-y-auto text-xs text-slate-400">
            {instructions.map((inst, i) => {
              const done = i < clampedIndex;
              const active = i === clampedIndex;
              const prefix = instructionMoveLabel(inst);
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
        </details>
      ) : null}
    </section>
  );
}
