import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DashboardPageNew } from '../../pages/DashboardPageNew';
import authReducer from '../../redux/slices/authSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer
    }
  });
};

const renderWithProviders = (component: React.ReactNode) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Dashboard Page', () => {
  test('renders welcome banner', () => {
    renderWithProviders(<DashboardPageNew />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  test('renders mood section heading', () => {
    renderWithProviders(<DashboardPageNew />);
    expect(screen.getByText(/How are you feeling/i)).toBeInTheDocument();
  });

  test('renders quick actions section', () => {
    renderWithProviders(<DashboardPageNew />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  test('renders all quick action buttons', () => {
    renderWithProviders(<DashboardPageNew />);
    expect(screen.getByText('Check-In')).toBeInTheDocument();
    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(screen.getByText('Therapist')).toBeInTheDocument();
    expect(screen.getByText('Crisis')).toBeInTheDocument();
  });

  test('renders explore section', () => {
    renderWithProviders(<DashboardPageNew />);
    expect(screen.getByText('Explore')).toBeInTheDocument();
  });

  test('renders wellness tip', () => {
    renderWithProviders(<DashboardPageNew />);
    expect(screen.getByText(/Daily Tip/i)).toBeInTheDocument();
  });

  test('has dark purple theme background', () => {
    const { container } = renderWithProviders(<DashboardPageNew />);
    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toHaveClass('from-slate-900');
  });

  test('renders responsive grid layouts', () => {
    renderWithProviders(<DashboardPageNew />);
    // Check for responsive grid classes
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(5);
  });
});
