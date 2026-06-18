import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from 'app/App';

export * as Pages from 'app/pages/ember';

const roots = new Map<HTMLElement, Root>();

export function mount(
  Component: React.ComponentType<unknown>,
  target: HTMLElement,
  args: Record<string, unknown>
): void {
  let root = roots.get(target);

  if (!root) {
    root = createRoot(target);
    roots.set(target, root);
  }

  root.render(
    <BrowserRouter>
      <App>
        <Component {...args} />
      </App>
    </BrowserRouter>
  );
}

export function unmount(target: HTMLElement): void {
  const root = roots.get(target);

  if (root) {
    root.unmount();
    roots.delete(target);
  }
}
