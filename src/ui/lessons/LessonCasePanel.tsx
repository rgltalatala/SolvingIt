import type { ReactNode } from 'react';
import { lessonLayout } from '../../content/tips';

type LessonCasePanelProps = {
  title: string;
  body?: string;
  dimmed?: boolean;
  children?: React.ReactNode;
};

export function LessonCasePanel({
  title,
  body,
  dimmed,
  children,
}: LessonCasePanelProps) {
  return (
    <section
      className={`rounded-xl border border-slate-700 bg-slate-900/80 p-4 ${dimmed ? 'opacity-60' : ''}`}
    >
      <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
      {body ? (
        <div className="mt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {lessonLayout.goalHeading}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {body}
          </p>
        </div>
      ) : null}
      {children}
    </section>
  );
}
