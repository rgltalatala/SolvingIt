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
          slotLabels: ['White–Blue', 'White–Red', 'White–Green', 'White–Orange'],
          ariaLabel: '1 of 4 cross edges',
        }}
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
    expect(screen.getByText('1 / 4')).toBeInTheDocument();
    expect(screen.getByText('White–Blue')).toBeInTheDocument();
  });

  it('fills only solved pieces with sticker colors; current uses border only', () => {
    const { container } = render(
      <LessonProgress
        progress={{
          solved: 2,
          total: 4,
          slots: [
            {
              key: 'DF',
              label: 'White–Blue',
              solved: true,
              colors: ['white', 'blue'],
            },
            {
              key: 'DR',
              label: 'White–Red',
              solved: false,
              isCurrent: true,
              colors: ['white', 'red'],
            },
            { key: 'DB', label: 'White–Green', solved: false },
            {
              key: 'DL',
              label: 'White–Orange',
              solved: true,
              colors: ['white', 'orange'],
            },
          ],
          ariaLabel: '2 of 4 cross edges',
        }}
      />,
    );

    const segments = container.querySelectorAll('[role="progressbar"] > div');
    expect(segments).toHaveLength(4);

    const dfHalves = segments[0].querySelectorAll('div');
    expect(dfHalves).toHaveLength(2);
    expect(dfHalves[0]).toHaveStyle({ backgroundColor: colorHexMap.white });
    expect(dfHalves[1]).toHaveStyle({ backgroundColor: colorHexMap.blue });

    expect(segments[1].querySelectorAll('div')).toHaveLength(0);
    expect(segments[1]).toHaveClass('bg-slate-700');
    expect(segments[1]).toHaveClass('ring-violet-400');

    expect(segments[2].querySelectorAll('div')).toHaveLength(0);

    const dlHalves = segments[3].querySelectorAll('div');
    expect(dlHalves[0]).toHaveStyle({ backgroundColor: colorHexMap.white });
    expect(dlHalves[1]).toHaveStyle({ backgroundColor: colorHexMap.orange });

    expect(screen.getByText('White–Blue')).toHaveClass('text-emerald-400');
    expect(screen.getByText('White–Red')).toHaveClass('text-slate-500');
  });

  it('outlines the current unsolved slot without changing unsolved empty fill', () => {
    const { container } = render(
      <LessonProgress
        progress={{
          solved: 1,
          total: 4,
          slots: [
            {
              key: 'DF',
              label: 'White–Blue',
              solved: true,
              colors: ['white', 'blue'],
            },
            {
              key: 'DR',
              label: 'White–Red',
              solved: false,
              isCurrent: true,
              colors: ['white', 'red'],
            },
            { key: 'DB', label: 'White–Green', solved: false },
            { key: 'DL', label: 'White–Orange', solved: false },
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

  it('fills solved corners with white plus both side colors', () => {
    const { container } = render(
      <LessonProgress
        progress={{
          solved: 1,
          total: 4,
          slots: [
            {
              key: 'FRD',
              label: 'White–Blue–Red',
              solved: true,
              colors: ['white', 'blue', 'red'],
            },
            { key: 'BDR', label: 'White–Red–Green', solved: false },
            { key: 'BLD', label: 'White–Green–Orange', solved: false },
            { key: 'FDL', label: 'White–Orange–Blue', solved: false },
          ],
          ariaLabel: '1 of 4 corners',
        }}
      />,
    );

    const thirds = container.querySelectorAll('[role="progressbar"] > div > div');
    expect(thirds).toHaveLength(3);
    expect(thirds[0]).toHaveStyle({ backgroundColor: colorHexMap.white });
    expect(thirds[1]).toHaveStyle({ backgroundColor: colorHexMap.blue });
    expect(thirds[2]).toHaveStyle({ backgroundColor: colorHexMap.red });
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
