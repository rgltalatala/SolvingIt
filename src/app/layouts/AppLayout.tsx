import { Outlet } from 'react-router';
import { LessonTopNav } from '@/app/layouts/LessonTopNav';
import { madeBy } from '@/content/onboarding/ui';
import { useCubeStore } from '@/app/store/cubeStore';

export function AppLayout() {
  const appPhase = useCubeStore((state) => state.appPhase);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <LessonTopNav showEndLesson={appPhase === 'learning'} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      <footer className="flex w-full shrink-0 justify-end px-3 text-xs leading-none text-slate-500">
        <p>
          {madeBy.prefix}
          <a
            href={madeBy.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-400"
          >
            {madeBy.name}
          </a>
        </p>
      </footer>
    </div>
  );
}
