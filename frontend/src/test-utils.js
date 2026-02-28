import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Our custom render function
function renderWithRouter(
  ui, // The component to render
  {
    // A custom option to pass the route
    initialEntries = ['/'],
    ...renderOptions
  } = {}
) {
  // The wrapper component that includes the MemoryRouter
  function Wrapper({ children }) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
  }

  // Use RTL's render function with our new wrapper
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override the original render method with our custom one
export { renderWithRouter as render };
