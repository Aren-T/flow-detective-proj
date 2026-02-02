import { render, screen, act } from '@testing-library/react';
import App from './App';

test('renders Flow Detective title', async () => {
  await act(async () => {
    render(<App />);
  });
  const linkElement = screen.getByText(/Flow Detective/i);
  expect(linkElement).toBeInTheDocument();
});
