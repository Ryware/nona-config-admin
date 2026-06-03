import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { Router, Route } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { MetaProvider } from '@solidjs/meta';
import { ToastProvider } from '../../components/ui/toast';
import ProjectApiKeysPage from '../../pages/projects/ProjectApiKeysPage';
import { mockToken } from '../mocks/data';

const maskedAKey = `${'*'.repeat(48)}${'A'.repeat(8)}`;
const maskedCKey = `${'*'.repeat(48)}${'C'.repeat(8)}`;

function renderProjectApiKeysPage(slug = 'my-app') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  window.history.pushState({}, '', `/projects/${slug}/api-keys`);

  return render(() => (
    <MetaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            <Route path="/projects/:slug/api-keys" component={ProjectApiKeysPage} />
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </MetaProvider>
  ));
}

describe('ProjectApiKeysPage', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', mockToken);
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('displays API keys hidden by default', async () => {
    renderProjectApiKeysPage('my-app');

    expect(await screen.findByText('Web Client')).toBeInTheDocument();
    expect(screen.getByText('Production Mobile')).toBeInTheDocument();
    expect(screen.getByText('Project-wide')).toBeInTheDocument();
    expect(screen.getByText(maskedAKey)).toBeInTheDocument();
    expect(screen.queryByText('A'.repeat(64))).not.toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Show API key Web Client'));
    expect(screen.getByText('A'.repeat(64))).toBeInTheDocument();
  });

  it('generates an environment-scoped API key', async () => {
    renderProjectApiKeysPage('my-app');

    expect(await screen.findByRole('heading', { name: 'my-app API Keys' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('production').length).toBeGreaterThan(0);
    });
    const generateButton = await screen.findByRole('button', { name: /generate api key/i });
    fireEvent.click(generateButton);

    fireEvent.input(screen.getByLabelText(/^name$/i), {
      target: { value: 'Mobile App' },
    });
    fireEvent.change(screen.getByLabelText(/environment/i), {
      target: { value: 'production' },
    });
    fireEvent.change(screen.getByLabelText(/scope/i), {
      target: { value: 'all' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^generate$/i }));

    expect(await screen.findByText('Mobile App')).toBeInTheDocument();
    expect(screen.getByText(maskedCKey)).toBeInTheDocument();
    expect(screen.queryByText('C'.repeat(64))).not.toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Show API key Mobile App'));
    expect(screen.getByText('C'.repeat(64))).toBeInTheDocument();
  });

  it('deletes an API key from the project list', async () => {
    renderProjectApiKeysPage('my-app');

    expect(await screen.findByText('Web Client')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Delete API key Web Client'));

    await waitFor(() => {
      expect(screen.queryByText('Web Client')).not.toBeInTheDocument();
    });
  });
});
