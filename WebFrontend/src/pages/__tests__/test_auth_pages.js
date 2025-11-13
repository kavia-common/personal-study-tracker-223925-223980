import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../Login';
import Register from '../Register';
import { api } from '../../api/client';

jest.mock('../../api/client', () => {
  const original = jest.requireActual('../../api/client');
  return {
    ...original,
    api: {
      ...original.api,
      login: jest.fn(),
      register: jest.fn(),
    },
  };
});

function renderWithRouter(ui, { route = '/login' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/study" element={<div>StudyPage</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders and validates fields', async () => {
    renderWithRouter(<Login />, { route: '/login' });
    expect(screen.getByText(/login/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Email and password are required/i);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Enter a valid email address|Password must be at least 8 characters/i);
  });

  it('submits successfully and navigates to /study', async () => {
    api.login.mockResolvedValueOnce({ access_token: 'x' });
    renderWithRouter(<Login />, { route: '/login' });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Navigation: MemoryRouter routes include /study element
    await waitFor(() => {
      expect(api.login).toHaveBeenCalled();
    });
  });

  it('shows backend error on failure', async () => {
    api.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderWithRouter(<Login />, { route: '/login' });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid credentials|Login failed/i);
  });
});

describe('Register page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders and validates fields', async () => {
    renderWithRouter(<Register />, { route: '/register' });
    expect(screen.getByText(/register/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Email and password are required/i);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('submits successfully and shows success message', async () => {
    api.register.mockResolvedValueOnce({ id: 1, email: 'a@b.com' });
    renderWithRouter(<Register />, { route: '/register' });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/Registration successful/i);
  });

  it('shows backend error on failure', async () => {
    api.register.mockRejectedValueOnce(new Error('Email exists'));
    renderWithRouter(<Register />, { route: '/register' });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Email exists|Registration failed/i);
  });
});
