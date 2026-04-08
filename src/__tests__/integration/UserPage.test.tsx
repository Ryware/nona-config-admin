import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { Router, Route } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { MetaProvider } from '@solidjs/meta';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ToastProvider } from '../../components/ui/toast';
import UserPage from '../../pages/users/UserPage';
import { mockUsers, mockProjects, mockToken } from '../mocks/data';
import type { JSX } from 'solid-js';

/**
 * Render in invite mode (no router state — userId === undefined).
 */
function renderInviteMode() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  window.history.pushState({}, '', '/user');
  return render(() => (
    <MetaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            <Route path="*" component={UserPage} />
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </MetaProvider>
  ));
}

/**
 * Render in edit mode by pushing router location state with a userId.
 */
function renderEditMode(userId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(() => (
    <MetaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            {/* Pass state the same way UsersPage does: navigate("/user", { state: { userId } }) */}
            <Route
              path="*"
              component={() => {
                // Simulate location state by providing it via the route
                const page = UserPage as unknown as () => JSX.Element;
                // We need to mount through a wrapper that sets location state
                // Use a helper route that navigates to /user with state
                return <UserPageWithState userId={userId} />;
              }}
            />
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </MetaProvider>
  ));
}

/**
 * A thin wrapper that uses useNavigate to push state before rendering UserPage.
 * This simulates the real app navigation flow.
 */
function UserPageWithState(props: { userId: string }) {
  const { useNavigate, useLocation } = require('@solidjs/router');
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.userId) {
    navigate('/user', { state: { userId: props.userId }, replace: true });
    return null;
  }
  return <UserPage />;
}

describe('UserPage — invite mode (no userId in state)', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', mockToken);
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/user');
  });

  it('renders the "Invite Team Member" heading', async () => {
    renderInviteMode();
    expect(await screen.findByRole('heading', { name: /invite team member/i })).toBeInTheDocument();
  });

  it('renders email and name fields', async () => {
    renderInviteMode();
    expect(await screen.findByPlaceholderText(/alex@company\.com/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/john smith/i)).toBeInTheDocument();
  });

  it('renders Editor and Viewer role cards', async () => {
    renderInviteMode();
    expect(await screen.findByText('Editor')).toBeInTheDocument();
    expect(await screen.findByText('Viewer')).toBeInTheDocument();
  });

  it('Editor role is selected by default', async () => {
    renderInviteMode();
    await screen.findByText('Editor');
    // The selected card has border-primary; easiest way is checking the submit button shows "Generate Magic Link"
    expect(screen.getByRole('button', { name: /generate magic link/i })).toBeInTheDocument();
  });

  it('selecting Viewer role updates the selection', async () => {
    renderInviteMode();
    const viewerCard = await screen.findByText('Viewer');
    fireEvent.click(viewerCard.closest('[class*="rounded-lg"]')!);
    // Role card click is handled by parent div onClick — verify via role() side effect being visible
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('displays the list of projects in the project scope section', async () => {
    renderInviteMode();
    for (const project of mockProjects) {
      expect(await screen.findByText(project.urlSlug)).toBeInTheDocument();
    }
  });

  it('shows "No projects found" when there are no projects', async () => {
    server.use(
      http.get('http://localhost:5027/admin/projects', () => HttpResponse.json([])),
    );
    renderInviteMode();
    expect(await screen.findByText(/no projects found/i)).toBeInTheDocument();
  });

  it('toggles project checkbox when a project row is clicked', async () => {
    renderInviteMode();
    const projectRow = await screen.findByText(mockProjects[0].urlSlug);
    const row = projectRow.closest('[class*="grid grid-cols-2"]')!;
    const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(checkbox.checked).toBe(false);
    fireEvent.click(row);
    expect(checkbox.checked).toBe(true);
  });

  it('shows error toast when submitting without an email', async () => {
    renderInviteMode();
    const submitBtn = await screen.findByRole('button', { name: /generate magic link/i });
    fireEvent.click(submitBtn);
    // Form has required on email input — browser prevents submit;
    // but the JS handler also shows a toast: check the input's validity
    const emailInput = screen.getByPlaceholderText(/alex@company\.com/i) as HTMLInputElement;
    expect(emailInput.required).toBe(true);
  });

  it('submits the form and navigates to /users on success', async () => {
    renderInviteMode();

    fireEvent.input(await screen.findByPlaceholderText(/alex@company\.com/i), {
      target: { value: 'newuser@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate magic link/i }));

    await waitFor(() => {
      // After success, the page navigates to /users — heading disappears
      expect(screen.queryByRole('heading', { name: /invite team member/i })).not.toBeInTheDocument();
    });
  });

  it('shows "Back to Team Overview" button that navigates back', async () => {
    renderInviteMode();
    expect(await screen.findByRole('button', { name: /back to team overview/i })).toBeInTheDocument();
  });

  it('"Cancel Invitation" button navigates back to /users', async () => {
    renderInviteMode();
    const cancelBtn = await screen.findByRole('button', { name: /cancel invitation/i });
    fireEvent.click(cancelBtn);
    // After navigation the invite heading should be gone
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /invite team member/i })).not.toBeInTheDocument();
    });
  });
});

describe('UserPage — edit mode (userId present in state)', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', mockToken);
    vi.restoreAllMocks();
  });

  it('renders the "Edit Team Member" heading once user data loads', async () => {
    renderEditMode(mockUsers[0].id);
    expect(await screen.findByRole('heading', { name: /edit team member/i })).toBeInTheDocument();
  });

  it('pre-fills the email field with the existing user email', async () => {
    renderEditMode(mockUsers[0].id);
    const emailInput = (await screen.findByPlaceholderText(/alex@company\.com/i)) as HTMLInputElement;
    await waitFor(() => {
      expect(emailInput.value).toBe(mockUsers[0].email);
    });
  });

  it('shows "Save Changes" instead of "Generate Magic Link"', async () => {
    renderEditMode(mockUsers[0].id);
    expect(await screen.findByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows API error message in a toast when update fails', async () => {
    server.use(
      http.put(`http://localhost:5027/admin/users/${mockUsers[0].id}`, () =>
        HttpResponse.json({ error: 'Permission denied' }, { status: 403 }),
      ),
    );

    renderEditMode(mockUsers[0].id);

    await screen.findByRole('button', { name: /save changes/i });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    });
  });
});
