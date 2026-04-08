import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { Router, Route } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { MetaProvider } from '@solidjs/meta';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ToastProvider } from '../../components/ui/toast';
import AuditLogsPage from '../../pages/audit-logs/AuditLogsPage';
import { mockProjects, mockUsers, mockToken } from '../mocks/data';

function renderAuditLogsPage() {
  window.history.pushState({}, '', '/audit-logs');
  return render(() => (
    <MetaProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
        <ToastProvider>
          <Router>
            <Route path="*" component={AuditLogsPage} />
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </MetaProvider>
  ));
}

describe('AuditLogsPage', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', mockToken);
    vi.restoreAllMocks();
  });

  it('renders the Activity Feed heading', async () => {
    renderAuditLogsPage();
    expect(await screen.findByRole('heading', { name: /activity feed/i })).toBeInTheDocument();
  });

  it('renders a "Created Project" entry for each project', async () => {
    renderAuditLogsPage();
    for (const project of mockProjects) {
      expect(await screen.findByText(project.name)).toBeInTheDocument();
    }
  });

  it('renders an "Invited User" entry for each user', async () => {
    renderAuditLogsPage();
    for (const user of mockUsers) {
      expect(await screen.findByText(user.email)).toBeInTheDocument();
    }
  });

  it('renders the search input', async () => {
    renderAuditLogsPage();
    expect(await screen.findByPlaceholderText(/filter audit trail/i)).toBeInTheDocument();
  });

  it('renders the Export Logs button', async () => {
    renderAuditLogsPage();
    expect(await screen.findByRole('button', { name: /export logs/i })).toBeInTheDocument();
  });

  it('filters entries by search text', async () => {
    renderAuditLogsPage();

    // Wait for entries to load
    await screen.findByText(mockProjects[0].name);

    const searchInput = screen.getByPlaceholderText(/filter audit trail/i);
    fireEvent.input(searchInput, { target: { value: mockProjects[0].name } });

    await waitFor(() => {
      // The searched project should still be visible
      expect(screen.getByText(mockProjects[0].name)).toBeInTheDocument();
      // The second project should be filtered out
      expect(screen.queryByText(mockProjects[1].name)).not.toBeInTheDocument();
    });
  });

  it('shows all entries after clearing the search', async () => {
    renderAuditLogsPage();
    await screen.findByText(mockProjects[0].name);

    const searchInput = screen.getByPlaceholderText(/filter audit trail/i);
    fireEvent.input(searchInput, { target: { value: mockProjects[0].name } });

    await waitFor(() => {
      expect(screen.queryByText(mockProjects[1].name)).not.toBeInTheDocument();
    });

    fireEvent.input(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText(mockProjects[1].name)).toBeInTheDocument();
    });
  });

  it('shows an empty log when there are no projects or users', async () => {
    server.use(
      http.get('http://localhost:5027/admin/projects', () => HttpResponse.json([])),
      http.get('http://localhost:5027/admin/users', () => HttpResponse.json([])),
    );

    renderAuditLogsPage();

    // Wait for queries to settle — no project/user text should appear
    await waitFor(() => {
      for (const project of mockProjects) {
        expect(screen.queryByText(project.name)).not.toBeInTheDocument();
      }
    });
  });
});
