import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import HomePage from './HomePage';

// Mock axios
jest.mock('axios');

// Mock child components with simple implementations
jest.mock('../../components/_searchBar/_searchBar.js', () => ({
  __esModule: true,
  default: () => <div data-testid="search-bar">Search Bar</div>
}));

jest.mock('../../components/_leftSideBar/_leftSideBar.js', () => ({
  __esModule: true,
  default: () => <div data-testid="left-sidebar">Left Sidebar</div>
}));

jest.mock('../../components/_rightSideBar/_rightSideBar.js', () => ({
  __esModule: true,
  default: () => <div data-testid="right-sidebar">Right Sidebar</div>
}));

jest.mock('../../components/_postsList/_postsList.js', () => ({
  __esModule: true,
  default: () => <div data-testid="posts-list">Posts List</div>
}));

// Mock useUser hook
jest.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    user: {
      email: 'test@dlsu.edu.ph',
      givenName: 'Test',
      familyName: 'User'
    },
    error: null
  })
}));

// Mock window.scrollTo
beforeEach(() => {
  jest.clearAllMocks();
  window.scrollTo = jest.fn();
  axios.get.mockResolvedValueOnce({
    data: []
  });
});

test('renders HomePage with all main components', async () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
  
  await waitFor(() => {
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('posts-list')).toBeInTheDocument();
  });
});

test('renders filter buttons', async () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
  
  await waitFor(() => {
    expect(screen.getByText('Any Sport')).toBeInTheDocument();
    expect(screen.getByText('Any Location')).toBeInTheDocument();
    expect(screen.getByText('Any Date/Time')).toBeInTheDocument();
    expect(screen.getByText('Create an Event')).toBeInTheDocument();
  });
});