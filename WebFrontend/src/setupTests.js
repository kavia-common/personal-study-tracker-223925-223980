/* eslint-disable no-undef */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

beforeAll(() => {
  // Provide a default API base for tests that depend on it
  process.env.REACT_APP_API_BASE = 'http://localhost:3001';
});

// Mock global fetch if not present
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Stub window.confirm and alert used in Sessions page
if (!window.confirm) {
  window.confirm = jest.fn(() => true);
}
if (!window.alert) {
  window.alert = jest.fn();
}
