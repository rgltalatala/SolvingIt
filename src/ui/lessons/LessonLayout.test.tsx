import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { colorHexMap } from '../../cube/cubeColors';
import { LessonProgress } from './LessonProgress';
import { LessonCurrentInstruction } from './LessonCurrentInstruction';
import { lessonLayout } from '../../content/tips';

describe('LessonProgress', () => {
  afterEach(() => cleanup());

  it('renders slot progress with accessible label', () => {
    render(
      <LessonProgress
        progress={{
          solved: 1,
          total: 4,
          slotLabels: ['DF', 'DR', 'DB', 'DL'],
          ariaLabel: '1 of 4 cross edges',
        }}
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
    expect(screen.getByText('1 / 4')).toBeInTheDocument();
    expect(screen.getByText('DF')).toBeInTheDocument();
  });

  it('colors solved slots by partner color instead of fill order', () => {
    const { container } = render(
      <LessonProgress
        progress={{
          solved: 2,
          total: 4,
          slots: [
            { key: 'DF', label: 'DF', solved: true, color: 'blue' },
            { key: 'DR', label: 'DR', solved: false },
            { key: 'DB', label: 'DB', solved: false },
            { key: 'DL', label: 'DL', solved: true, color: 'orange' },
          ],
          ariaLabel: '2 of 4 cross edges',
        }}
      />,
    );

    const segments = container.querySelectorAll('[role="progressbar"] > div');
    expect(segments).toHaveLength(4);
    expect(segments[0]).toHaveStyle({
      backgroundColor: colorHexMap.blue,
    });
    expect(segments[1]).toHaveStyle({ backgroundColor: '' });
    expect(segments[3]).toHaveStyle({
      backgroundColor: colorHexMap.orange,
    });
    expect(screen.getByText('DF')).toHaveStyle({ color: colorHexMap.blue });
    expect(screen.getByText('DL')).toHaveStyle({ color: colorHexMap.orange });
  });

  it('outlines the current unsolved slot without changing its fill', () => {
    const { container } = render(
      <LessonProgress
        progress={{
          solved: 1,
          total: 4,
          slots: [
            { key: 'DF', label: 'DF', solved: true, color: 'blue' },
            { key: 'DR', label: 'DR', solved: false, isCurrent: true },
            { key: 'DB', label: 'DB', solved: false },
            { key: 'DL', label: 'DL', solved: false },
          ],
          ariaLabel: '1 of 4 cross edges',
        }}
      />,
    );

    const segments = container.querySelectorAll('[role="progressbar"] > div');
    expect(segments[1]).toHaveClass('bg-slate-700');
    expect(segments[1]).toHaveClass('ring-violet-400');
    expect(segments[2]).toHaveClass('bg-slate-700');
    expect(segments[2]).not.toHaveClass('ring-violet-400');
  });
});

describe('LessonCurrentInstruction', () => {
  afterEach(() => cleanup());

  it('shows only the current step prominently with move badge', () => {
    const { container } = render(
      <LessonCurrentInstruction
        instructions={[
          { type: 'move', move: 'R', text: 'Turn the right face clockwise.' },
          { type: 'move', move: 'U', text: 'Turn the top face clockwise.' },
        ]}
        activeIndex={0}
      />,
    );
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
    expect(
      container.querySelector('.text-lg')?.textContent,
    ).toBe('Turn the right face clockwise.');
    expect(screen.getByText('[R]')).toBeInTheDocument();
    expect(screen.getByText(lessonLayout.seeAllSteps)).toBeInTheDocument();
  });
});
