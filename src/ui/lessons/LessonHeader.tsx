import type { ReactNode } from 'react';
import { lessonLayout } from '../../content/tips';
import { formatLessonDisplayTitle } from './formatLessonTitle';
import { LessonHeaderActions } from './LessonHeaderActions';
import { LessonProgress, type LessonProgressConfig } from './LessonProgress';

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
}: LessonHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className={`text-3xl font-bold ${titleClassName ?? ''}`}>
          {formatLessonDisplayTitle(title)}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-slate-300">{subtitle}</p>
        ) : null}
        {progress ? <LessonProgress progress={progress} /> : null}
      </div>
      <details className="shrink-0 text-sm">
        <summary className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-300 hover:text-slate-100">
          {lessonLayout.lessonOptions}
        </summary>
        <div className="mt-2 flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-900/80 p-3">
          <LessonHeaderActions
            canUndo={canUndo}
            isStepPending={isStepPending}
            onUndo={onUndo}
            onRescan={onRescan}
            onResetTips={onResetTips}
            extraActions={extraSessionActions}
          />
          <details className="text-xs text-slate-400">
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
        </div>
      </details>
    </header>
  );
}
