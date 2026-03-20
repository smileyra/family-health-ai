import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Component', () => {
    it('renders the dashboard heading', () => {
        render(<App />);
        expect(screen.getByText(/Good evening, Family!/i)).toBeInTheDocument();
    });

    it('renders the Healthy Home logo/header', () => {
        render(<App />);
        expect(screen.getByText(/Healthy Home/i)).toBeInTheDocument();
    });
});
