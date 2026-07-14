import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

type Options = Omit<RenderOptions, 'wrapper'> & {
  initialEntries?: string[];
};

/** Render UI that uses React Router hooks inside a MemoryRouter. */
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: Options = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
