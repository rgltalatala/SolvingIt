import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSolvedCubeState } from '../cube/cubeState';
import { ui } from '../content/ui';
import { applyHints, PHYSICAL_CUBE_MATCH_NOTE } from '../content/tips';
import { useCubeStore } from '../store/cubeStore';
import { LearningCrossView } from './LearningCrossView';

vi.mock('./MoveSequenceDemo', () => ({
  MoveSequenceDemo: ({
    moves,
    trailingActions,
  }: {
    moves: string[];
    trailingActions?: React.ReactNode;
  }) => (
    <div data-testid="move-sequence-demo">
      {moves.join(' ') || 'no-moves'}
      {trailingActions}
    </div>
  ),
}));

vi.mock('./lessons/bottomLayer/useWhiteCrossLessonStep', () => ({
  useWhiteCrossLessonStep: vi.fn(),
}));

import { useWhiteCrossLessonStep } from './lessons/bottomLayer/useWhiteCrossLessonStep';

const mockUseWhiteCrossLessonStep = vi.mocked(useWhiteCrossLessonStep);

function seedStore() {
  const cube = createSolvedCubeState();
  useCubeStore.setState({
    cubeState: cube,
    scannedFaces: {
      U: cube.U,
      D: cube.D,
      F: cube.F,
      B: cube.B,
      R: cube.R,
      L: cube.L,
    },
    appPhase: 'learning',
    activeLesson: 'white-cross',
    lessonHistory: [],
  });
}

function mockCrossLessonStep(
  overrides: Partial<ReturnType<typeof useWhiteCrossLessonStep>> = {},
) {
  mockUseWhiteCrossLessonStep.mockReturnValue({
    step: {
      kind: 'align-to-center',
      title: 'Connect edge',
      body: 'Turn the front face.',
      edgeLabel: 'Green edge',
      partnerColor: 'green',
      face: 'F',
      demoMoves: ['F'],
    },
    isStepPending: false,
    showPreparingOverlay: false,
    isLessonComplete: false,
    solvedSlots: 0,
    recomputeStep: vi.fn(),
    hasSeenStrategyIntro: true,
    advanceAfterStep: vi.fn(),
    resetStrategyIntro: vi.fn(),
    ...overrides,
  });
}

describe('LearningCrossView', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    seedStore();
    mockCrossLessonStep();
  });

  it('shows strategy intro with continue before edge solves', async () => {
    const advanceAfterStep = vi.fn();
    const recomputeStep = vi.fn();
    mockCrossLessonStep({
      step: {
        kind: 'intro',
        title: 'How this lesson works',
        body: 'Look for edge pieces with a white sticker.',
      },
      hasSeenStrategyIntro: false,
      advanceAfterStep,
      recomputeStep,
    });

    render(<LearningCrossView />);
    expect(screen.getByText(/white sticker/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ui.continue })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: ui.applyExampleContinue }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: ui.continue }));
    expect(advanceAfterStep).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'intro' }),
    );
    expect(recomputeStep).toHaveBeenCalled();
  });

  it('shows apply when the step has a demo', () => {
    render(<LearningCrossView />);
    expect(
      screen.getByRole('button', { name: ui.applyExampleContinue }),
    ).toBeEnabled();
    expect(screen.getByTestId('move-sequence-demo')).toHaveTextContent('F');
  });

  it('hides demo preview when step has no demo moves', () => {
    mockCrossLessonStep({
      step: {
        kind: 'solve-edge',
        title: 'Stuck edge',
        body: 'No automated demo.',
        edgeLabel: 'Red edge',
        partnerColor: 'red',
      },
      solvedSlots: 1,
    });

    render(<LearningCrossView />);
    expect(screen.getByTestId('move-sequence-demo')).toHaveTextContent(
      'no-moves',
    );
    expect(
      screen.queryByRole('button', { name: ui.applyExampleContinue }),
    ).not.toBeInTheDocument();
  });

  it('enables undo when lesson history has entries', async () => {
    useCubeStore.setState({
      lessonHistory: [
        {
          cubeState: createSolvedCubeState(),
          scannedFaces: {},
        },
      ],
    });

    render(<LearningCrossView />);
    expect(
      screen.getByRole('button', { name: 'Undo last example' }),
    ).toBeEnabled();
  });

  it('shows physical cube confirmation copy in header and apply panel', () => {
    render(<LearningCrossView />);
    expect(screen.getByText(PHYSICAL_CUBE_MATCH_NOTE)).toBeInTheDocument();
    expect(screen.getByText(applyHints.default)).toBeInTheDocument();
  });
});
