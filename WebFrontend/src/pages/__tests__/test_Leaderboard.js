import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Leaderboard from '../Leaderboard';
import { api } from '../../api/client';

jest.mock('../../api/client', () => {
  const original = jest.requireActual('../../api/client');
  return {
    ...original,
    api: {
      ...original.api,
      getLeaderboard: jest.fn(),
    },
  };
});

describe('Leaderboard page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches and renders rankings', async () => {
    api.getLeaderboard.mockResolvedValueOnce({
      all_time: [
        { user_id: 1, email: 'a@b.com', total_minutes: 300 },
        { user_id: 2, email: 'c@d.com', total_minutes: 200 },
      ],
      last_30_days: [
        { user_id: 2, email: 'c@d.com', total_minutes: 150 },
      ],
    });

    render(<Leaderboard />);

    expect(await screen.findByText(/Leaderboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/a@b.com — 300 min/)).toBeInTheDocument();
    expect(screen.getByText(/c@d.com — 150 min/)).toBeInTheDocument();
  });

  it('handles API error', async () => {
    api.getLeaderboard.mockRejectedValueOnce(new Error('API down'));
    render(<Leaderboard />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/API down|Failed to load leaderboard/i);
  });

  it('refresh with custom Top N', async () => {
    api.getLeaderboard.mockResolvedValueOnce({ all_time: [], last_30_days: [] });
    api.getLeaderboard.mockResolvedValueOnce({
      all_time: [{ user_id: 1, email: 'x@y.com', total_minutes: 50 }],
      last_30_days: [],
    });

    render(<Leaderboard />);
    await screen.findByText(/No data./i);

    const input = screen.getByLabelText(/Top N/i);
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));

    expect(await screen.findByText(/x@y.com — 50 min/)).toBeInTheDocument();
  });
});
