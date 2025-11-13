import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app layout', () => {
  render(<App />);
  const altText = screen.getByRole('button', { name: /switch to/i });
  expect(altText).toBeInTheDocument();
});
