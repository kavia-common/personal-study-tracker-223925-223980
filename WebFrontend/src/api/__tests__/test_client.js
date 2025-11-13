import { api, authStore, ApiError } from '../client';

describe('api client request/headers and error handling', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
    // Reset token/localStorage
    authStore.setToken(null);
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  function mockFetchOnce({ status = 200, body = {}, headers = {} } = {}) {
    global.fetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      text: async () => (body === null ? '' : JSON.stringify(body)),
      headers: {
        get: (k) => headers[k.toLowerCase()],
      },
    });
  }

  test('builds URL using REACT_APP_API_BASE and sends JSON with optional Authorization', async () => {
    // no token
    mockFetchOnce({ body: { hello: 'world' } });
    await api.getLeaderboard({ top: 5 }); // auth: false in implementation
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toBe('http://localhost:3001/leaderboard?top=5');

    // With token and auth endpoint (e.g., me)
    authStore.setToken('abc123');
    mockFetchOnce({ body: { id: 1, email: 'a@b.com' } });
    await api.me();
    const [, options] = global.fetch.mock.calls[1];
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers.Authorization).toBe('Bearer abc123');
  });

  test('login stores token via authStore and localStorage fallback works', async () => {
    mockFetchOnce({ body: { access_token: 'jwt-token', token_type: 'bearer' } });
    await api.login({ email: 'test@example.com', password: 'password123' });

    expect(authStore.isAuthenticated()).toBe(true);
    expect(authStore.getToken()).toBe('jwt-token');
    // validate it persisted
    expect(window.localStorage.getItem('pst_jwt')).toBe('jwt-token');

    // subsequent authed request contains header
    mockFetchOnce({ body: { result: 'ok' } });
    await api.createSession({ topic: 'Math', minutes: 30, session_date: '2024-01-01' });
    const [, opts] = global.fetch.mock.calls[1];
    expect(opts.headers.Authorization).toBe('Bearer jwt-token');
  });

  test('throws ApiError on non-2xx with parsed message', async () => {
    mockFetchOnce({ status: 400, body: { detail: 'Bad input' } });
    await expect(
      api.register({ email: 'bad', password: 'short' })
    ).rejects.toEqual(expect.any(ApiError));

    try {
      await api.register({ email: 'bad', password: 'short' });
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.message).toBe('Bad input');
      expect(e.status).toBe(400);
      expect(e.details).toEqual({ detail: 'Bad input' });
    }
  });

  test('client-side validation throws ApiError for missing fields', async () => {
    await expect(api.register({ email: '', password: '' })).rejects.toBeInstanceOf(ApiError);
    await expect(api.login({ email: '', password: '' })).rejects.toBeInstanceOf(ApiError);
    await expect(api.createSession({ topic: '', minutes: 0, session_date: '' })).rejects.toBeInstanceOf(ApiError);
  });

  test('deleteSession returns success on 204 without body', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: async () => '',
    });
    const res = await api.deleteSession(1);
    expect(res).toEqual({ success: true });
  });
});
