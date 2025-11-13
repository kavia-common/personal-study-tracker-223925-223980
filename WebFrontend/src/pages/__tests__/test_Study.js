import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Study from '../Study';
import { api } from '../../api/client';

jest.mock('../../api/client', () => {
  const original = jest.requireActual('../../api/client');
  return {
    ...original,
    api: {
      ...original.api,
      createSession: jest.fn(),
    },
  };
});

describe('Study page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('validates inputs and shows errors', async () => {
    render(<Study />);
    fireEvent.click(screen.getByRole('button', { name: /save session/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Topic is required/i);
  });

  it('creates session successfully and shows success', async () => {
    api.createSession.mockResolvedValueOnce({ id: 1 });
    render(<Study />);

    fireEvent.change(screen.getByLabelText(/topic/i), { target: { value: 'Physics' } });
    fireEvent.change(screen.getByLabelText(/minutes/i), { target: { value: '25' } });
    // Date input already has default of today; leave as is
    fireEvent.click(screen.getByRole('button', { name: /save session/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/Session recorded!/i);
    expect(api.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'Physics', minutes: 25, session_date: expect.any(String) })
    );
  });

  it('shows backend error on failure', async () => {
    api.createSession.mockRejectedValueOnce(new Error('Backend unavailable'));
    render(<Study />);
    fireEvent.change(screen.getByLabelText(/topic/i), { target: { value: 'Chemistry' } });
    fireEvent.change(screen.getByLabelText(/minutes/i), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: /save session/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Backend unavailable|Failed to create session/i);
  });
});
