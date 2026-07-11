import type { ReactNode } from 'react';

type LessonSplitLayoutProps = {
  cube: ReactNode;
  sidebar: ReactNode;
};

export function LessonSplitLayout({ cube, sidebar }: LessonSplitLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:sticky lg:top-24 lg:self-start">{cube}</div>
      <div className="flex flex-col gap-4">{sidebar}</div>
    </div>
  );
}
