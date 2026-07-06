import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ui } from '../../content/ui';
import { LessonHeaderActions } from './LessonHeaderActions';

describe('LessonHeaderActions', () => {
  it('calls onRescan when Re-scan cube is clicked', async () => {
    const onRescan = vi.fn();
    const user = userEvent.setup();

    render(
      <LessonHeaderActions
        canUndo={false}
        isStepPending={false}
        onUndo={vi.fn()}
        onRescan={onRescan}
        onBack={vi.fn()}
        onResetTips={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: ui.rescanCube }));
    expect(onRescan).toHaveBeenCalledTimes(1);
  });
});
