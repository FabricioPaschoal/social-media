import React from 'react';
import { render, screen } from './test-utils';
import Navbar from '@/components/layout/Navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    loading: false,
    logout: jest.fn(),
  }),
}));

describe('Navbar', () => {
  it('renders the app logo', () => {
    render(<Navbar />);

    expect(screen.getByText('SocialAI')).toBeInTheDocument();
  });

  it('renders navigation links with translations', () => {
    render(<Navbar />);

    // Desktop + mobile nav both render links, so use getAllByText
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Create Post').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Post History').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Accounts').length).toBeGreaterThanOrEqual(1);
  });

  it('renders user name', () => {
    render(<Navbar />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders logout button with translation', () => {
    render(<Navbar />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    render(<Navbar />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
