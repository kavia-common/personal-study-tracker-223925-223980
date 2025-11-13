import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Sessions from '../Sessions';
import { api } from '../../api/client';

jest.mock('../../api/client', () => {
  const original = jest.requireActual('../../api/client');
  return {
    ...original,
    api: {
      ...original.api,
      listSessions: jest.fn(),
      deleteSession: jest.fn(),
      updateSession: jest.fn(),
    },
  };
});

describe('Sessions page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches and renders list with totals', async () => {
    api.listSessions.mockResolvedValueOnce({
      items: [
        { id: 1, topic: 'Math', minutes: 30, session_date: '2024-01-01' },
        { id: 2, topic: 'CS', minutes: 45, session_date: '2024-01-02' },
      ],
      total: 2,
      page: 1,
      size: 10,
      total_minutes: 75,
    });

    render(<Sessions />);

    expect(await screen.findByText(/Total Sessions: 2 • Total Minutes: 75/i)).toBeInTheDocument();
    expect(screen.getByText(/Math/)).toBeInTheDocument();
    expect(screen.getByText(/CS/)).toBeInTheDocument();
  });

  it('handles empty state', async () => {
    api.listSessions.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      size: 10,
      total_minutes: 0,
    });
    render(<Sessions />);

    expect(await screen.findByText(/No sessions yet./i)).toBeInTheDocument();
  });

  it('shows API error', async () => {
    api.listSessions.mockRejectedValueOnce(new Error('Fetch error'));
    render(<Sessions />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Fetch error|Failed to load sessions/i);
  });

  it('applies topic filter', async () => {
    api.listSessions
      .mockResolvedValueOnce({
        items: [{ id: 3, topic: 'Biology', minutes: 50, session_date: '2024-02-01' }],
        total: 1,
        page: 1,
        size: 10,
        total_minutes: 50,
      })
      .mockResolvedValueOnce({
        items: [{ id: 4, topic: 'Physics', minutes: 40, session_date: '2024-02-02' }],
        total: 1,
        page: 1,
        size: 10,
        total_minutes: 40,
      });

    render(<Sessions />);
    // First load
    await screen.findByText(/Biology/);

    fireEvent.change(screen.getByPlaceholderText(/Filter by topic/i), { target: { value: 'phys' } });
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    await waitFor(() => expect(screen.getByText(/Physics/)).toBeInTheDocument());
  });
});
