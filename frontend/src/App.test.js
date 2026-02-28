import { render, screen } from '@testing-library/react';
import App from './App.js';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

/* test cant find element with learn react so removed it for now
test('renders learn react link', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});*/


test('renders login button text', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  const linkElement = screen.getByText(/log in with DLSU Google Account/i);
  expect(linkElement).toBeInTheDocument();
});
