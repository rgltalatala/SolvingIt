import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSolvedCubeState, applyMoves } from '../cube/cubeState';
import { ui } from '../content/ui';
import { useCubeStore } from '../store/cubeStore';
import { LearningCornersView } from './LearningCornersView';

vi.mock('./lessons/LessonViewShell', () => ({
  LessonViewShell: ({
    header,
    step,
    cube,
    demo,
  }: {
    header: { title: string };
    step: { body?: string };
    cube: {
      isComplete: boolean;
      visibleDemo?: { moves?: string[] } | null;
    };
    demo?: {
      canApply: boolean;
      applyLabel: string;
      onApply: () => void;
      alternateActions?: React.ReactNode;
    };
  }) => (
    <div>
      <h1>{header.title}</h1>
      {!cube.isComplete ? (
        <div data-testid="move-sequence-demo">
          {cube.visibleDemo?.moves?.join(' ') || 'no-moves'}
        </div>
      ) : null}
      {step.body ? <p>{step.body}</p> : null}
      {demo?.alternateActions}
      {demo?.canApply ? (
        <button type="button" onClick={demo.onApply}>
          {demo.applyLabel}
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock('./lessons/bottomLayer/useWhiteCornerLessonStep', () => ({
  useWhiteCornerLessonStep: vi.fn(),
}));

import { useWhiteCornerLessonStep } from './lessons/bottomLayer/useWhiteCornerLessonStep';

const mockUseWhiteCornerLessonStep = vi.mocked(useWhiteCornerLessonStep);

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
    activeLesson: 'white-corners',
    lessonHistory: [],
  });
}

function mockCornerLessonStep(
  overrides: Partial<ReturnType<typeof useWhiteCornerLessonStep>> = {},
) {
  mockUseWhiteCornerLessonStep.mockReturnValue({
    step: {
      kind: 'solve-corner',
      title: 'Front–right corner',
      body: 'Insert the corner.',
      cornerId: 'FRD',
      demoMoves: ['R', 'U', "R'"],
    },
    isStepPending: false,
    showPreparingOverlay: false,
    isLessonComplete: false,
    solvedSlots: 0,
    recomputeStep: vi.fn(),
    currentHoldIndex: 0,
    solvedCornerIds: [],
    hasSeenStrategyIntro: true,
    sessionUndoStack: [],
    advanceAfterStep: vi.fn(),
    undoCornerSessionStep: vi.fn(),
    resetCornerSession: vi.fn(),
    ...overrides,
  });
}

describe('LearningCornersView', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    seedStore();
    mockCornerLessonStep();
  });

  it('shows strategy intro with continue before corner solves', async () => {
    const advanceAfterStep = vi.fn();
    const recomputeStep = vi.fn();
    mockCornerLessonStep({
      step: {
        kind: 'intro',
        title: 'How this lesson works',
        body: 'We solve every corner into the front-right-bottom slot (FRD).',
      },
      hasSeenStrategyIntro: false,
      advanceAfterStep,
      recomputeStep,
    });

    render(<LearningCornersView />);
    expect(screen.getByText(/front-right-bottom slot \(FRD\)/)).toBeInTheDocument();
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
    render(<LearningCornersView />);
    expect(
      screen.getByRole('button', { name: ui.applyExampleContinue }),
    ).toBeEnabled();
    expect(screen.getByTestId('move-sequence-demo')).toHaveTextContent(
      "R U R'",
    );
  });

  it('shows continue for reorient-hold steps', () => {
    mockCornerLessonStep({
      step: {
        kind: 'reorient-hold',
        title: 'Face the red side',
        body: 'Turn the cube.',
        demoMoves: ['y'],
        targetCornerId: 'BDR',
      },
      solvedSlots: 1,
      solvedCornerIds: ['FRD'],
    });

    render(<LearningCornersView />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('renders wrong-D demos with embedded y rotations without crashing', () => {
    mockCornerLessonStep({
      step: {
        kind: 'solve-corner',
        title: 'Front–right corner',
        body: 'Extract and insert.',
        cornerId: 'FRD',
        demoMoves: ['R', 'U', "R'", "U'", 'U', 'R', 'U', "R'"],
      },
    });

    render(<LearningCornersView />);
    expect(
      screen.getByRole('button', { name: ui.applyExampleContinue }),
    ).toBeEnabled();
    expect(screen.getByTestId('move-sequence-demo')).toBeInTheDocument();
  });

  it('shows hold-native demo at hold 1 without blue-front face relabeling', () => {
    const cube = applyMoves(createSolvedCubeState(), ['y']);
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
      activeLesson: 'white-corners',
      lessonHistory: [],
    });
    mockCornerLessonStep({
      step: {
        kind: 'solve-corner',
        title: 'Back–right corner',
        body: 'Insert the corner.',
        cornerId: 'BDR',
        demoMoves: ['U', 'R', "U'", "R'"],
      },
      solvedSlots: 1,
      currentHoldIndex: 1,
      solvedCornerIds: ['FRD'],
    });

    render(<LearningCornersView />);
    const demo = screen.getByTestId('move-sequence-demo');
    expect(demo).toHaveTextContent("U R U' R'");
    expect(demo).not.toHaveTextContent("U F U' F'");
  });

  it('links to white cross lesson on cross-prerequisite', async () => {
    mockCornerLessonStep({
      step: {
        kind: 'cross-prerequisite',
        title: 'Complete the white cross first',
        body: 'Finish the cross.',
      },
    });

    render(<LearningCornersView />);
    expect(screen.queryByText(/front-right-bottom slot \(FRD\)/)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Go to white cross lesson' }),
    );
    expect(useCubeStore.getState().activeLesson).toBe('white-cross');
  });
});
