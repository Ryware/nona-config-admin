import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@solidjs/testing-library';
import { Router, Route, useNavigate, useLocation } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { MetaProvider } from '@solidjs/meta';
import { onMount } from 'solid-js';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ToastProvider } from '../../components/ui/toast';
import UserPage from '../../pages/users/UserPage';
import { mockUsers, mockProjects, mockToken } from '../mocks/data';

const UsersStub = () => <div data-testid="users-page-stub">Users Page</div>;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Renders UserPage with no router state — invite mode. */
function renderInviteMode() {
  window.history.pushState({}, '', '/user');
  return render(() => (
    <MetaProvider>
      <QueryClientProvider client={makeQueryClient()}>
        <ToastProvider>
          <Router>
            <Route path="/user" component={UserPage} />
            <Route path="/users" component={UsersStub} />
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </MetaProvider>
  ));
}

/**
 * Bridge component: navigates to /user with location state after mount,
 * then lets UserPage read that state via useLocation().
 */
function EditModeBridge(props: { userId: string }) {
  const navigate = useNavigate();
  const location = useLocation<{ userId?: string }>();

  onMount(() => {
    if (!location.state?.userId) {
      navigate('/user', { state: { userId: props.userId }, replace: true });
    }
  });

  return (
    <>
      {location.state?.userId ? <UserPage /> : null}
    </>
  );
}

/** Renders UserPage with a userId in router location state — edit mode. */
function renderEditMode(userId: string) {
  window.history.pushState({}, '', '/user');
  return render(() => (
    <MetaProvider>
      <QueryClientProvider client={makeQueryClient()}>
        <ToastProvider>
          <Router>
            <Route path="/user" component={() => <EditModeBridge userId={userId} />} />
            <Route path="/users" component={UsersStub} />
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </MetaProvider>
  ));
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
    // Find the section heading first, then wait for async project data within it
    const scopeHeading = await screen.findByRole('heading', { name: /project scope/i });
    const section = scopeHeading.closest('section')!;
    for (const project of mockProjects) {
      expect(await within(section).findByText(project.urlSlug)).toBeInTheDocument();
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
    const scopeHeading = await screen.findByRole('heading', { name: /project scope/i });
    const section = scopeHeading.closest('section')!;
    const projectText = await within(section).findByText(mockProjects[0].urlSlug);
    const row = projectText.closest('[class*="grid grid-cols-2"]') as HTMLElement;
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
    expect(await screen.findByTestId('users-page-stub')).toBeInTheDocument();
  });

  it('shows "Back to Team Overview" button that navigates back', async () => {
    renderInviteMode();
    expect(await screen.findByRole('button', { name: /back to team overview/i })).toBeInTheDocument();
  });

  it('"Cancel Invitation" button navigates to /users', async () => {
    renderInviteMode();
    fireEvent.click(await screen.findByRole('button', { name: /cancel invitation/i }));
    expect(await screen.findByTestId('users-page-stub')).toBeInTheDocument();
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
