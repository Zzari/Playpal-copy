import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import Login from './Login.js';
import { API_BASE_URL } from '../../config.js';

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

beforeEach(() => {
  jest.clearAllMocks();
  // reset mock implementation
  mockOpen.mockImplementation(() => {});
});

test('renders logo and tagline', () => {
  render(<Login />);
  
  // Logo image
  const logo = screen.getByAltText(/PlayPal Logo/i);
  expect(logo).toBeInTheDocument();

  // Tagline
  const tagline = screen.getByText(/Find Your Fit. Play with Pals/i);
  expect(tagline).toBeInTheDocument();
});

test('renders login instructions and handbook link', () => {
  render(<Login />);
  
  const instructions = screen.getByText(/Log in with your DLSU Google account/i);
  expect(instructions).toBeInTheDocument();

  const handbookLink = screen.getByRole('link', {
    name: /DLSU Student Handbook/i
  });
  expect(handbookLink).toHaveAttribute('href', expect.stringContaining('dlsu.edu.ph'));
});

test('renders login button with icon and text', () => {
  render(<Login />);
  
  const loginButton = screen.getByRole('button', {
    name: /Log In with DLSU Google Account/i
  });
  expect(loginButton).toBeInTheDocument();
});

test('clicking login button opens Google OAuth URL', () => {
  render(<Login />);
  
  const loginButton = screen.getByRole('button', {
    name: /Log In with DLSU Google Account/i
  });

  fireEvent.click(loginButton);

  // need to change this since Login isnt using useNavigate
  expect(window.open).toHaveBeenCalledTimes(1);
  expect(window.open).toHaveBeenCalledWith(
    `${API_BASE_URL}/auth/google`,
    '_self'
  );
});
