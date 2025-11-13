import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import { authStore } from '../../api/client';

function ProtectedChild() {
  return <div>Protected Content</div>;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authStore.setToken(null);
  });

  it('redirects unauthenticated users to /login', () => {
    render(
      <MemoryRouter initialEntries={['/study']}>
        <Routes>
          <Route
            path="/study"
            element={
              <ProtectedRoute>
                <ProtectedChild />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    authStore.setToken('token');
    render(
      <MemoryRouter initialEntries={['/study']}>
        <Routes>
          <Route
            path="/study"
            element={
              <ProtectedRoute>
                <ProtectedChild />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
  });
});
