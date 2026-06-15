import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createSolvedCubeState } from '../cube/cubeState'
import { useCubeStore } from '../store/cubeStore'
import { LearningCrossView } from './LearningCrossView'

vi.mock('./MoveSequenceDemo', () => ({
  MoveSequenceDemo: ({ moves }: { moves: string[] }) => (
    <div data-testid="move-sequence-demo">{moves.join(' ') || 'no-moves'}</div>
  ),
}))

vi.mock('./lessons/bottomLayer/useWhiteCrossLessonStep', () => ({
  useWhiteCrossLessonStep: vi.fn(),
}))

import { useWhiteCrossLessonStep } from './lessons/bottomLayer/useWhiteCrossLessonStep'

const mockUseWhiteCrossLessonStep = vi.mocked(useWhiteCrossLessonStep)

function seedStore() {
  const cube = createSolvedCubeState()
  useCubeStore.setState({
    cubeState: cube,
    scannedFaces: { U: cube.U, D: cube.D, F: cube.F, B: cube.B, R: cube.R, L: cube.L },
    appPhase: 'learning',
    lessonHistory: [],
  })
}

describe('LearningCrossView', () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    seedStore()
    mockUseWhiteCrossLessonStep.mockReturnValue({
      step: {
        kind: 'side-connect',
        title: 'Connect edge',
        body: 'Turn the front face.',
        face: 'F',
        demoMoves: ['F'],
      },
      isStepPending: false,
      showPreparingOverlay: false,
      isLessonComplete: false,
      solvedSlots: 0,
      recomputeStep: vi.fn(),
    })
  })

  it('shows apply when the step has a demo', () => {
    render(<LearningCrossView />)
    expect(screen.getByRole('button', { name: 'Apply example & continue' })).toBeEnabled()
    expect(screen.getByTestId('move-sequence-demo')).toHaveTextContent('F')
  })

  it('hides demo preview when step has no demo moves', () => {
    mockUseWhiteCrossLessonStep.mockReturnValue({
      step: {
        kind: 'solve-edge',
        title: 'Stuck edge',
        body: 'No automated demo.',
        edgeLabel: 'Red edge',
        partnerColor: 'red',
      },
      isStepPending: false,
      showPreparingOverlay: false,
      isLessonComplete: false,
      solvedSlots: 1,
      recomputeStep: vi.fn(),
    })

    render(<LearningCrossView />)
    expect(screen.getByTestId('move-sequence-demo')).toHaveTextContent('no-moves')
    expect(screen.queryByRole('button', { name: 'Apply example & continue' })).not.toBeInTheDocument()
  })

  it('enables undo when lesson history has entries', async () => {
    useCubeStore.setState({
      lessonHistory: [
        {
          cubeState: createSolvedCubeState(),
          scannedFaces: {},
        },
      ],
    })

    render(<LearningCrossView />)
    expect(screen.getByRole('button', { name: 'Undo last example' })).toBeEnabled()
  })

  it('shows physical cube confirmation copy in header and apply panel', () => {
    render(<LearningCrossView />)
    expect(screen.getByText(/Confirm your physical cube matches the virtual cube/i)).toBeInTheDocument()
    expect(screen.getByText(/When your physical cube matches the diagram/i)).toBeInTheDocument()
  })
})
