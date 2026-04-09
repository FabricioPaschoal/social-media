import React from 'react';
import { render, screen } from './test-utils';
import SignupPage from '@/app/auth/signup/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SignupPage', () => {
  it('renders the sign up heading', () => {
    render(<SignupPage />);

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<SignupPage />);

    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Confirm Password')).toBeInTheDocument();
  });

  it('renders sign up button', () => {
    render(<SignupPage />);

    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    render(<SignupPage />);

    expect(screen.getByText(/Already have an account/)).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('renders password placeholder hint', () => {
    render(<SignupPage />);

    expect(screen.getByPlaceholderText('Min. 6 characters')).toBeInTheDocument();
  });
});
