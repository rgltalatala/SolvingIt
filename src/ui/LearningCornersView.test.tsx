import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSolvedCubeState, applyMoves } from '../cube/cubeState';
import { useCubeStore } from '../store/cubeStore';
import { LearningCornersView } from './LearningCornersView';

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

describe('LearningCornersView', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    seedStore();
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
      sessionUndoStack: [],
      advanceAfterStep: vi.fn(),
      undoCornerSessionStep: vi.fn(),
      resetCornerSession: vi.fn(),
    });
  });

  it('shows apply when the step has a demo', () => {
    render(<LearningCornersView />);
    expect(
      screen.getByRole('button', { name: 'Apply example & continue' }),
    ).toBeEnabled();
    expect(screen.getByTestId('move-sequence-demo')).toHaveTextContent(
      "R U R'",
    );
  });

  it('shows continue for reorient-hold steps', () => {
    mockUseWhiteCornerLessonStep.mockReturnValue({
      step: {
        kind: 'reorient-hold',
        title: 'Face the red side',
        body: 'Turn the cube.',
        demoMoves: ['y'],
        targetCornerId: 'BDR',
      },
      isStepPending: false,
      showPreparingOverlay: false,
      isLessonComplete: false,
      solvedSlots: 1,
      recomputeStep: vi.fn(),
      currentHoldIndex: 0,
      solvedCornerIds: ['FRD'],
      sessionUndoStack: [],
      advanceAfterStep: vi.fn(),
      undoCornerSessionStep: vi.fn(),
      resetCornerSession: vi.fn(),
    });

    render(<LearningCornersView />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('renders wrong-D demos with embedded y rotations without crashing', () => {
    mockUseWhiteCornerLessonStep.mockReturnValue({
      step: {
        kind: 'solve-corner',
        title: 'Front–right corner',
        body: 'Extract and insert.',
        cornerId: 'FRD',
        demoMoves: ['R', 'U', "R'", "U'", 'U', 'R', 'U', "R'"],
      },
      isStepPending: false,
      showPreparingOverlay: false,
      isLessonComplete: false,
      solvedSlots: 0,
      recomputeStep: vi.fn(),
      currentHoldIndex: 0,
      solvedCornerIds: [],
      sessionUndoStack: [],
      advanceAfterStep: vi.fn(),
      undoCornerSessionStep: vi.fn(),
      resetCornerSession: vi.fn(),
    });

    render(<LearningCornersView />);
    expect(
      screen.getByRole('button', { name: 'Apply example & continue' }),
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
    mockUseWhiteCornerLessonStep.mockReturnValue({
      step: {
        kind: 'solve-corner',
        title: 'Back–right corner',
        body: 'Insert the corner.',
        cornerId: 'BDR',
        demoMoves: ['U', 'R', "U'", "R'"],
      },
      isStepPending: false,
      showPreparingOverlay: false,
      isLessonComplete: false,
      solvedSlots: 1,
      recomputeStep: vi.fn(),
      currentHoldIndex: 1,
      solvedCornerIds: ['FRD'],
      sessionUndoStack: [],
      advanceAfterStep: vi.fn(),
      undoCornerSessionStep: vi.fn(),
      resetCornerSession: vi.fn(),
    });

    render(<LearningCornersView />);
    const demo = screen.getByTestId('move-sequence-demo');
    expect(demo).toHaveTextContent("U R U' R'");
    expect(demo).not.toHaveTextContent("U F U' F'");
  });

  it('links to white cross lesson on cross-prerequisite', async () => {
    mockUseWhiteCornerLessonStep.mockReturnValue({
      step: {
        kind: 'cross-prerequisite',
        title: 'Complete the white cross first',
        body: 'Finish the cross.',
      },
      isStepPending: false,
      showPreparingOverlay: false,
      isLessonComplete: false,
      solvedSlots: 0,
      recomputeStep: vi.fn(),
      currentHoldIndex: 0,
      solvedCornerIds: [],
      sessionUndoStack: [],
      advanceAfterStep: vi.fn(),
      undoCornerSessionStep: vi.fn(),
      resetCornerSession: vi.fn(),
    });

    render(<LearningCornersView />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Go to white cross lesson' }),
    );
    expect(useCubeStore.getState().activeLesson).toBe('white-cross');
  });
});
