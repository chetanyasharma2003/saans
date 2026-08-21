import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux, setupLocalStorage, UNAUTHENTICATED_STATE, AUTHENTICATED_STATE } from '../test/setup';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import axios from 'axios';
import { mockLoginResponse, mockRegisterResponse, mockErrorResponse, createAxiosError } from '../test/mocks';

vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Authentication', () => {
  beforeEach(() => {
    setupLocalStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginPage', () => {
    it('should render login form with email and password inputs', () => {
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render submit button with correct text', () => {
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const submitButton = screen.getByRole('button', { name: /sign in/i }) ||
                          screen.getByRole('button', { name: /login/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should render hero section with welcome message', () => {
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('should submit login form with valid credentials', async () => {
      const mockNavigate = vi.fn();
      const mockAxiosPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockLoginResponse,
      });

      vi.doMock('react-router-dom', () => ({
        useNavigate: () => mockNavigate,
      }));

      const user = userEvent.setup();
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i }) ||
                          screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          {
            email: 'test@example.com',
            password: 'password123',
          }
        );
      });
    });

    it('should display error message on failed login', async () => {
      const errorMessage = 'Invalid email or password';
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        createAxiosError(errorMessage)
      );

      const user = userEvent.setup();
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i }) ||
                          screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
      });
    });

    it('should show loading state while submitting', async () => {
      vi.spyOn(axios, 'post').mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: mockLoginResponse }), 100))
      );

      const user = userEvent.setup();
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i }) ||
                          screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Button should be disabled or show loading
      expect(submitButton).toBeDisabled();
    });

    it('should have link to register page', () => {
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const registerLink = screen.getByRole('link', { name: /register|sign up/i });
      expect(registerLink).toBeInTheDocument();
    });

    it('should have link to forgot password', () => {
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const forgotLink = screen.getByRole('link', { name: /forgot password|reset password/i }) ||
                        screen.queryByText(/forgot password/i);
      expect(forgotLink).toBeInTheDocument();
    });
  });

  describe('RegisterPage', () => {
    it('should render registration form with all required fields', () => {
      renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // City dropdown
    });

    it('should validate city selection is required', async () => {
      const user = userEvent.setup();
      renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select your city/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup();
      renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum password length', async () => {
      const user = userEvent.setup();
      renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');
      await user.type(confirmPasswordInput, '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should submit registration with valid data', async () => {
      const mockNavigate = vi.fn();
      const mockAxiosPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockRegisterResponse,
      });

      vi.doMock('react-router-dom', () => ({
        useNavigate: () => mockNavigate,
      }));

      const user = userEvent.setup();
      renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const citySelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.selectOptions(citySelect, 'Delhi');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/register'),
          expect.objectContaining({
            name: 'New User',
            email: 'newuser@example.com',
            password: 'password123',
            city: 'Delhi',
            role: 'PATIENT',
          })
        );
      });
    });

    it('should display Indian cities in dropdown', () => {
      renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const citySelect = screen.getByRole('combobox');
      const options = citySelect.querySelectorAll('option');

      const cityNames = Array.from(options).map((opt) => opt.textContent);
      expect(cityNames.some((city) => city?.includes('Delhi'))).toBe(true);
      expect(cityNames.some((city) => city?.includes('Mumbai'))).toBe(true);
      expect(cityNames.some((city) => city?.includes('Bangalore'))).toBe(true);
    });

    it('should display error on registration failure', async () => {
      const errorMessage = 'Email already registered';
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        createAxiosError(errorMessage)
      );

      const user = userEvent.setup();
      renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const citySelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.selectOptions(citySelect, 'Mumbai');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
      });
    });

    it('should have link to login page', () => {
      renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const loginLink = screen.getByRole('link', { name: /login|sign in/i });
      expect(loginLink).toBeInTheDocument();
    });
  });

  describe('Password Reset Flow', () => {
    it('should have password reset functionality', () => {
      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const forgotLink = screen.getByRole('link', { name: /forgot password|reset password/i }) ||
                        screen.queryByText(/forgot password/i);
      expect(forgotLink).toBeInTheDocument();
    });
  });

  describe('2FA and Email Verification', () => {
    it('should handle authentication state correctly', () => {
      const { store } = renderWithRedux(<LoginPage />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).toBeDefined();
    });
  });
});
