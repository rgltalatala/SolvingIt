import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '../cube/cubeState';
import type { CubeMoveAnimation } from '../cube3d/CubeView';
import { MoveSequenceDemo } from './MoveSequenceDemo';
import { ui } from '../content/ui';

vi.mock('../cube3d/CubeView', () => ({
  CubeView: ({
    moveAnimation,
  }: {
    moveAnimation?: CubeMoveAnimation | null;
  }) => (
    <div data-testid="cube-view">
      {moveAnimation ? (
        <button
          type="button"
          data-testid="complete-animation"
          onClick={() => moveAnimation.onComplete()}
        >
          complete-{moveAnimation.move}-{moveAnimation.direction ?? 'forward'}
        </button>
      ) : null}
    </div>
  ),
}));

describe('MoveSequenceDemo', () => {
  afterEach(() => cleanup());

  const baseCubeState = cubeStateToStudentFrame(createSolvedCubeState());

  it('steps forward through moves with animation', async () => {
    const user = userEvent.setup();
    render(
      <MoveSequenceDemo baseCubeState={baseCubeState} moves={['F', 'R']} />,
    );

    expect(screen.getByText('Start position')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next move' }));
    expect(screen.getByText('Animating: F')).toBeInTheDocument();
    await user.click(screen.getByTestId('complete-animation'));
    expect(screen.getByText(/Applied: F/)).toBeInTheDocument();
  });

  it('animates reverse on Previous move', async () => {
    const user = userEvent.setup();
    render(
      <MoveSequenceDemo baseCubeState={baseCubeState} moves={['F', 'R']} />,
    );

    await user.click(screen.getByRole('button', { name: 'Next move' }));
    await user.click(screen.getByTestId('complete-animation'));
    expect(screen.getByText(/Applied: F/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous move' }));
    expect(screen.getByText('Undoing: F')).toBeInTheDocument();
    expect(screen.getByTestId('complete-animation')).toHaveTextContent(
      'complete-F-reverse',
    );
    await user.click(screen.getByTestId('complete-animation'));
    expect(screen.getByText('Start position')).toBeInTheDocument();
  });

  it('disables Previous at start and during animation', async () => {
    const user = userEvent.setup();
    render(<MoveSequenceDemo baseCubeState={baseCubeState} moves={['F']} />);

    expect(
      screen.getByRole('button', { name: 'Previous move' }),
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next move' }));
    expect(
      screen.getByRole('button', { name: 'Previous move' }),
    ).toBeDisabled();
  });

  it('renders trailing actions in the demo control row', () => {
    render(
      <MoveSequenceDemo
        baseCubeState={baseCubeState}
        moves={['F']}
        trailingActions={
          <button type="button">{ui.applyExampleContinue}</button>
        }
      />,
    );

    expect(
      screen.getByRole('button', { name: ui.applyExampleContinue }),
    ).toBeInTheDocument();
  });
});
