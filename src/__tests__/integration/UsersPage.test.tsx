import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { Router, Route } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { MetaProvider } from '@solidjs/meta';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ToastProvider } from '../../components/ui/toast';
import UsersPage from '../../pages/users/UsersPage';
import { mockUsers, mockToken } from '../mocks/data';
import type { JSX } from 'solid-js';

function renderWithProviders(ui: () => JSX.Element) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(() => (
    <MetaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            <Route path="*" component={ui} />
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </MetaProvider>
  ));
}

describe('UsersPage', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', mockToken);
    vi.restoreAllMocks();
  });

  it('renders the Team Management heading', async () => {
    renderWithProviders(() => <UsersPage />);
    expect(await screen.findByText(/team management/i)).toBeInTheDocument();
  });

  it('lists all users returned by the API', async () => {
    renderWithProviders(() => <UsersPage />);

    for (const user of mockUsers) {
      expect(await screen.findByText(user.email)).toBeInTheDocument();
    }
  });

  it('shows empty state when there are no users', async () => {
    server.use(
      http.get('http://localhost:5027/admin/users', () => HttpResponse.json([])),
    );

    renderWithProviders(() => <UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/no team members yet/i)).toBeInTheDocument();
    });
  });

  it('displays correct total member count', async () => {
    renderWithProviders(() => <UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(String(mockUsers.length))).toBeInTheDocument();
    });
  });

  it('shows action menu when more_vert button is clicked', async () => {
    renderWithProviders(() => <UsersPage />);

    await screen.findByText(mockUsers[0].email);

    // The action buttons contain the material icon text "more_vert" as their accessible name
    const menuButtons = await screen.findAllByRole('button', { name: 'more_vert' });
    fireEvent.click(menuButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit member/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });
  });

  it('opens delete confirmation dialog when Remove is clicked', async () => {
    renderWithProviders(() => <UsersPage />);

    await screen.findByText(mockUsers[0].email);

    // Open the action menu for the first user
    const menuButtons = await screen.findAllByRole('button', { name: 'more_vert' });
    fireEvent.click(menuButtons[0]);

    await waitFor(() => screen.getByRole('button', { name: /remove/i }));
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() => {
      // Confirmation modal has unique text "from this instance?"
      expect(screen.getByText(/from this instance/i)).toBeInTheDocument();
    });
  });

  it('closes the action menu when clicking outside', async () => {
    renderWithProviders(() => <UsersPage />);

    await screen.findByText(mockUsers[0].email);

    const menuButtons = await screen.findAllByRole('button', { name: 'more_vert' });
    fireEvent.click(menuButtons[0]);

    await waitFor(() => screen.getByRole('button', { name: /edit member/i }));

    // Click the overlay (fixed inset div)
    const overlay = document.querySelector('.fixed.inset-0.z-\\[5\\]') as HTMLElement;
    if (overlay) fireEvent.click(overlay);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /edit member/i })).not.toBeInTheDocument();
    });
  });

  it('"Invite Team Member" button navigates to /user', async () => {
    const navigatedPaths: string[] = [];
    vi.spyOn(window.history, 'pushState').mockImplementation((...args) => {
      const path = args[2] as string;
      if (path) navigatedPaths.push(path);
    });

    renderWithProviders(() => <UsersPage />);

    fireEvent.click(await screen.findByRole('button', { name: /invite team member/i }));

    await waitFor(() => {
      expect(navigatedPaths.some((p) => p.includes('/user'))).toBe(true);
    });

    vi.restoreAllMocks();
  });
});
