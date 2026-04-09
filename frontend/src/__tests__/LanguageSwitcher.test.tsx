import React from 'react';
import { render, screen, fireEvent } from './test-utils';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('LanguageSwitcher', () => {
  it('renders the language switcher with label', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
  });

  it('renders English and Portuguese options', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('English');
    expect(options[1]).toHaveTextContent('Português');
  });

  it('defaults to English locale', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('en');
  });

  it('sets cookie when language is changed', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'pt' } });

    expect(document.cookie).toContain('locale=pt');
  });
});
