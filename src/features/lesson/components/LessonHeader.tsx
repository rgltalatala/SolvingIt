import { useEffect, useRef, type ReactNode } from 'react';
import { lessonLayout } from '@/content/beginner/tips';
import { formatLessonDisplayTitle } from '@/features/lesson/utils/formatLessonTitle';
import { LessonHeaderActions } from '@/features/lesson/components/LessonHeaderActions';
import { LessonProgress, type LessonProgressConfig } from '@/features/lesson/components/LessonProgress';

export type SessionNote = {
  readonly label: string | null;
  readonly text: string;
};

type LessonHeaderProps = {
  title: string;
  subtitle?: string;
  titleClassName?: string;
  progress?: LessonProgressConfig;
  sessionNotesSummary: string;
  sessionNotes: readonly SessionNote[];
  canUndo: boolean;
  isStepPending: boolean;
  onUndo: () => void;
  onRescan: () => void;
  onResetTips: () => void;
  extraSessionActions?: ReactNode;
  /** Extra panels shown inside the overflow menu (avoid-back, etc.). */
  overflowExtra?: ReactNode;
};

export function LessonHeader({
  title,
  subtitle,
  titleClassName,
  progress,
  sessionNotesSummary,
  sessionNotes,
  canUndo,
  isStepPending,
  onUndo,
  onRescan,
  onResetTips,
  extraSessionActions,
  overflowExtra,
}: LessonHeaderProps) {
  const optionsMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const menu = optionsMenuRef.current;
    if (!menu) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!menu.open) return;
      if (event.target instanceof Node && menu.contains(event.target)) return;
      menu.open = false;
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  return (
    <header className="flex shrink-0 items-start gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h1
            className={`truncate text-lg font-bold leading-tight sm:text-xl ${titleClassName ?? ''}`}
          >
            {formatLessonDisplayTitle(title)}
          </h1>
        </div>
        {subtitle ? (
          <p className="mt-0.5 truncate text-xs text-slate-400 sm:text-sm">
            {subtitle}
          </p>
        ) : null}
        {progress ? (
          <div className="mt-1.5">
            <LessonProgress progress={progress} compact />
          </div>
        ) : null}
      </div>
      <details ref={optionsMenuRef} className="relative shrink-0 text-sm">
        <summary
          className="cursor-pointer list-none rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-slate-300 hover:text-slate-100 [&::-webkit-details-marker]:hidden"
          aria-label={lessonLayout.lessonOptionsMenu}
          title={lessonLayout.lessonOptions}
        >
          <span aria-hidden="true" className="text-base leading-none">
            ⋮
          </span>
        </summary>
        <div className="absolute right-0 z-30 mt-1 w-64 max-h-[min(70dvh,420px)] overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {lessonLayout.lessonOptions}
          </p>
          <LessonHeaderActions
            canUndo={canUndo}
            isStepPending={isStepPending}
            onUndo={onUndo}
            onRescan={onRescan}
            onResetTips={onResetTips}
            extraActions={extraSessionActions}
          />
          {sessionNotes.length > 0 ? (
            <details className="mt-3 text-xs text-slate-400">
              <summary className="cursor-pointer text-slate-300 hover:text-slate-100">
                {sessionNotesSummary}
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
                {sessionNotes.map((note) => (
                  <li key={note.text}>
                    {note.label ? (
                      <>
                        <span className="text-slate-300">{note.label}</span>{' '}
                        {note.text}
                      </>
                    ) : (
                      note.text
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {overflowExtra ? (
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-800 pt-3">
              {overflowExtra}
            </div>
          ) : null}
        </div>
      </details>
    </header>
  );
}
