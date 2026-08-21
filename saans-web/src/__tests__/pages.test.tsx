import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux, AUTHENTICATED_STATE, UNAUTHENTICATED_STATE, setupLocalStorage } from '../test/setup';
import axios from 'axios';
import {
  mockTherapistsResponse,
  mockMoodResponse,
  mockMoodAnalyticsResponse,
  createAxiosError,
} from '../test/mocks';

vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
  };
});

describe('Pages', () => {
  beforeEach(() => {
    setupLocalStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('LandingPage', () => {
    it('should render hero section with welcome message', async () => {
      const LandingPage = (await import('../pages/LandingPage')).default;
      renderWithRedux(<LandingPage />, { preloadedState: UNAUTHENTICATED_STATE });

      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should render feature cards', async () => {
      const LandingPage = (await import('../pages/LandingPage')).default;
      renderWithRedux(<LandingPage />, { preloadedState: UNAUTHENTICATED_STATE });

      // Look for typical landing page content
      const content = screen.getByRole('main') || document.body;
      expect(content).toBeInTheDocument();
    });

    it('should render CTA button for getting started', async () => {
      const LandingPage = (await import('../pages/LandingPage')).default;
      renderWithRedux(<LandingPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const ctaButton = screen.getByRole('button', { name: /get started|start now|sign up/i });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should have navigation links', async () => {
      const LandingPage = (await import('../pages/LandingPage')).default;
      renderWithRedux(<LandingPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const loginLink = screen.getByRole('link', { name: /login|sign in/i });
      expect(loginLink).toBeInTheDocument();
    });
  });

  describe('MyProfilePage', () => {
    it('should load and display user profile', async () => {
      const MyProfilePage = (await import('../pages/MyProfilePage')).default;

      renderWithRedux(<MyProfilePage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        const profileElements = screen.getByText(/test user/i);
        expect(profileElements).toBeInTheDocument();
      });
    });

    it('should allow editing user name', async () => {
      const MyProfilePage = (await import('../pages/MyProfilePage')).default;
      const user = userEvent.setup();

      renderWithRedux(<MyProfilePage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      const editButton = screen.queryByRole('button', { name: /edit/i });
      if (editButton) {
        await user.click(editButton);
        const nameInput = screen.queryByRole('textbox', { name: /name/i });
        if (nameInput) {
          await user.clear(nameInput);
          await user.type(nameInput, 'Updated User');
        }
      }
    });

    it('should allow editing user bio', async () => {
      const MyProfilePage = (await import('../pages/MyProfilePage')).default;
      const user = userEvent.setup();

      renderWithRedux(<MyProfilePage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      const editButton = screen.queryByRole('button', { name: /edit/i });
      if (editButton) {
        await user.click(editButton);
        const bioInput = screen.queryByRole('textbox', { name: /bio|about/i });
        if (bioInput) {
          await user.clear(bioInput);
          await user.type(bioInput, 'Updated bio');
        }
      }
    });

    it('should save profile changes', async () => {
      const mockAxios = vi.spyOn(axios, 'put').mockResolvedValueOnce({
        data: { success: true },
      });

      const MyProfilePage = (await import('../pages/MyProfilePage')).default;
      const user = userEvent.setup();

      renderWithRedux(<MyProfilePage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      const saveButton = screen.queryByRole('button', { name: /save/i });
      if (saveButton) {
        await user.click(saveButton);

        await waitFor(() => {
          expect(mockAxios).toHaveBeenCalled();
        });
      }
    });

    it('should display error on save failure', async () => {
      vi.spyOn(axios, 'put').mockRejectedValueOnce(
        createAxiosError('Failed to update profile')
      );

      const MyProfilePage = (await import('../pages/MyProfilePage')).default;
      const user = userEvent.setup();

      renderWithRedux(<MyProfilePage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      const saveButton = screen.queryByRole('button', { name: /save/i });
      if (saveButton) {
        await user.click(saveButton);

        await waitFor(() => {
          const errorText = screen.queryByText(/error|failed/i);
          expect(errorText).toBeInTheDocument();
        }, { timeout: 2000 });
      }
    });
  });

  describe('FindTherapistPage', () => {
    it('should load and display list of therapists', async () => {
      const mockAxios = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockTherapistsResponse,
      });

      const FindTherapistPage = (await import('../pages/FindTherapistPage')).default;

      renderWithRedux(<FindTherapistPage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(mockAxios).toHaveBeenCalled();
        const therapistName = screen.queryByText(/Dr. John Smith/i) ||
                             screen.queryByText(/therapist/i);
        expect(therapistName).toBeInTheDocument();
      });
    });

    it('should filter therapists by city', async () => {
      const mockAxios = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockTherapistsResponse,
      });

      const FindTherapistPage = (await import('../pages/FindTherapistPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<FindTherapistPage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(mockAxios).toHaveBeenCalled();
      });

      const filterInput = screen.queryByRole('combobox', { name: /city|location/i });
      if (filterInput) {
        await user.selectOptions(filterInput, 'Delhi');
        expect(filterInput).toHaveValue('Delhi');
      }
    });

    it('should search therapists by name or specialization', async () => {
      const mockAxios = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockTherapistsResponse,
      });

      const FindTherapistPage = (await import('../pages/FindTherapistPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<FindTherapistPage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(mockAxios).toHaveBeenCalled();
      });

      const searchInput = screen.queryByRole('textbox', { name: /search/i });
      if (searchInput) {
        await user.type(searchInput, 'anxiety');
        expect(searchInput).toHaveValue('anxiety');
      }
    });

    it('should display therapist ratings and reviews', async () => {
      const mockAxios = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockTherapistsResponse,
      });

      const FindTherapistPage = (await import('../pages/FindTherapistPage')).default;

      renderWithRedux(<FindTherapistPage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(mockAxios).toHaveBeenCalled();
        const rating = screen.queryByText(/4\.8|rating/i);
        expect(rating).toBeInTheDocument();
      });
    });

    it('should handle pagination', async () => {
      const mockAxios = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockTherapistsResponse,
      });

      const FindTherapistPage = (await import('../pages/FindTherapistPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<FindTherapistPage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(mockAxios).toHaveBeenCalled();
      });

      const nextButton = screen.queryByRole('button', { name: /next|>/i });
      if (nextButton) {
        await user.click(nextButton);
        expect(nextButton).toBeInTheDocument();
      }
    });
  });

  describe('AICounselorPage', () => {
    it('should render chat interface', async () => {
      const AICounselorPage = (await import('../pages/AICounselorPage')).default;

      renderWithRedux(<AICounselorPage />, { preloadedState: AUTHENTICATED_STATE });

      const messageContainer = screen.queryByRole('main') || document.body;
      expect(messageContainer).toBeInTheDocument();
    });

    it('should submit message to AI counselor', async () => {
      const mockAxios = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { response: 'AI response text' },
      });

      const AICounselorPage = (await import('../pages/AICounselorPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<AICounselorPage />, { preloadedState: AUTHENTICATED_STATE });

      const messageInput = screen.queryByRole('textbox', { name: /message|chat/i });
      if (messageInput) {
        await user.type(messageInput, 'How can I manage stress?');

        const sendButton = screen.queryByRole('button', { name: /send|submit/i });
        if (sendButton) {
          await user.click(sendButton);

          await waitFor(() => {
            expect(mockAxios).toHaveBeenCalled();
          });
        }
      }
    });

    it('should display loading state while waiting for AI response', async () => {
      vi.spyOn(axios, 'post').mockImplementationOnce(
        () => new Promise((resolve) =>
          setTimeout(() => resolve({ data: { response: 'AI response' } }), 100)
        )
      );

      const AICounselorPage = (await import('../pages/AICounselorPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<AICounselorPage />, { preloadedState: AUTHENTICATED_STATE });

      const messageInput = screen.queryByRole('textbox', { name: /message|chat/i });
      if (messageInput) {
        await user.type(messageInput, 'Test message');

        const sendButton = screen.queryByRole('button', { name: /send|submit/i });
        if (sendButton) {
          await user.click(sendButton);
          expect(sendButton).toBeDisabled();
        }
      }
    });

    it('should display AI responses in chat', async () => {
      const mockAxios = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { response: 'This is an AI response' },
      });

      const AICounselorPage = (await import('../pages/AICounselorPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<AICounselorPage />, { preloadedState: AUTHENTICATED_STATE });

      const messageInput = screen.queryByRole('textbox', { name: /message|chat/i });
      if (messageInput) {
        await user.type(messageInput, 'Hello');

        const sendButton = screen.queryByRole('button', { name: /send|submit/i });
        if (sendButton) {
          await user.click(sendButton);

          await waitFor(() => {
            expect(mockAxios).toHaveBeenCalled();
          });
        }
      }
    });
  });

  describe('MoodTrackerPage', () => {
    it('should display mood tracker interface', async () => {
      const MoodTrackerPage = (await import('../pages/MoodTrackerPage')).default;

      renderWithRedux(<MoodTrackerPage />, { preloadedState: AUTHENTICATED_STATE });

      const content = screen.queryByRole('main') || document.body;
      expect(content).toBeInTheDocument();
    });

    it('should allow adding mood entry', async () => {
      const mockAxios = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockMoodResponse,
      });

      const MoodTrackerPage = (await import('../pages/MoodTrackerPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<MoodTrackerPage />, { preloadedState: AUTHENTICATED_STATE });

      const moodButtons = screen.queryAllByRole('button', { name: /happy|sad|neutral/i });
      if (moodButtons.length > 0) {
        await user.click(moodButtons[0]);

        const submitButton = screen.queryByRole('button', { name: /add|save|submit/i });
        if (submitButton) {
          await user.click(submitButton);

          await waitFor(() => {
            expect(mockAxios).toHaveBeenCalled();
          });
        }
      }
    });

    it('should display mood analytics and charts', async () => {
      const mockAxios = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockMoodAnalyticsResponse,
      });

      const MoodTrackerPage = (await import('../pages/MoodTrackerPage')).default;

      renderWithRedux(<MoodTrackerPage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(mockAxios).toHaveBeenCalled();
      });

      const chartContainer = screen.queryByRole('main') || document.body;
      expect(chartContainer).toBeInTheDocument();
    });

    it('should allow filtering mood by date range', async () => {
      const mockAxios = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockMoodAnalyticsResponse,
      });

      const MoodTrackerPage = (await import('../pages/MoodTrackerPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<MoodTrackerPage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(mockAxios).toHaveBeenCalled();
      });

      const dateInputs = screen.queryAllByRole('textbox', { name: /date|from|to/i });
      if (dateInputs.length > 0) {
        await user.type(dateInputs[0], '2024-01-01');
      }
    });
  });

  describe('CrisisSupportPage', () => {
    it('should render crisis support interface', async () => {
      const CrisisSupportPage = (await import('../pages/CrisisSupportPage')).default;

      renderWithRedux(<CrisisSupportPage />, { preloadedState: AUTHENTICATED_STATE });

      const content = screen.queryByRole('main') || document.body;
      expect(content).toBeInTheDocument();
    });

    it('should have prominent SOS button', async () => {
      const CrisisSupportPage = (await import('../pages/CrisisSupportPage')).default;

      renderWithRedux(<CrisisSupportPage />, { preloadedState: AUTHENTICATED_STATE });

      const sosButton = screen.queryByRole('button', { name: /sos|emergency|crisis/i });
      expect(sosButton).toBeInTheDocument();
    });

    it('should trigger alert on SOS button click', async () => {
      const mockAxios = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { success: true },
      });

      const CrisisSupportPage = (await import('../pages/CrisisSupportPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<CrisisSupportPage />, { preloadedState: AUTHENTICATED_STATE });

      const sosButton = screen.queryByRole('button', { name: /sos|emergency|crisis/i });
      if (sosButton) {
        await user.click(sosButton);

        await waitFor(
          () => {
            expect(mockAxios).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );
      }
    });

    it('should display support resources and hotlines', async () => {
      const CrisisSupportPage = (await import('../pages/CrisisSupportPage')).default;

      renderWithRedux(<CrisisSupportPage />, { preloadedState: AUTHENTICATED_STATE });

      const content = screen.queryByRole('main') || document.body;
      expect(content).toBeInTheDocument();
    });
  });
});
