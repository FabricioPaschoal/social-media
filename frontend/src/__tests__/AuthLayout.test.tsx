import React from 'react';
import { render, screen } from './test-utils';
import AuthLayout from '@/components/layout/AuthLayout';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('AuthLayout', () => {
  it('renders the app name', () => {
    render(
      <AuthLayout>
        <div>Test content</div>
      </AuthLayout>,
    );

    expect(screen.getByText('SocialAI')).toBeInTheDocument();
  });

  it('renders the app tagline', () => {
    render(
      <AuthLayout>
        <div>Test content</div>
      </AuthLayout>,
    );

    expect(
      screen.getByText('AI-Powered Social Media Management'),
    ).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <AuthLayout>
        <div>Test child content</div>
      </AuthLayout>,
    );

    expect(screen.getByText('Test child content')).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    render(
      <AuthLayout>
        <div>Test content</div>
      </AuthLayout>,
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
