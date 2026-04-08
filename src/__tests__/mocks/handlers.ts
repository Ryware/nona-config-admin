import { http, HttpResponse } from 'msw';
import {
  mockProjects,
  mockEnvironments,
  mockConfigEntries,
  mockUsers,
  mockToken,
} from './data';

const BASE = 'http://localhost:5027';

export const handlers = [
  // ── Auth ────────────────────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({ token: mockToken, role: 'admin', expiresAt: '2099-01-01T00:00:00Z' });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    return HttpResponse.json({
      success: true,
      response: { token: mockToken, role: 'admin', expiresAt: '2099-01-01T00:00:00Z' },
      error: null,
    });
  }),

  http.get(`${BASE}/auth/first-time`, () => {
    return HttpResponse.json(false);
  }),

  // ── Projects ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/admin/projects`, () => {
    return HttpResponse.json(mockProjects);
  }),

  http.get(`${BASE}/admin/projects/:slug`, ({ params }) => {
    const project = mockProjects.find((p) => p.urlSlug === params.slug);
    if (!project) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(project);
  }),

  http.post(`${BASE}/admin/projects`, async ({ request }) => {
    const body = await request.json() as { name: string; description?: string };
    const created = {
      id: 'proj-new',
      urlSlug: body.name,
      name: body.name,
      description: body.description ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put(`${BASE}/admin/projects/:slug`, async ({ params, request }) => {
    const body = await request.json() as { name: string; description?: string };
    const project = mockProjects.find((p) => p.urlSlug === params.slug);
    if (!project) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ ...project, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${BASE}/admin/projects/:slug`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Environments ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/admin/projects/:projectId/environments`, ({ params }) => {
    const envs = mockEnvironments.filter((e) => e.project === params.projectId);
    return HttpResponse.json(envs);
  }),

  http.get(`${BASE}/admin/projects/:projectId/environments/:envName`, ({ params }) => {
    const env = mockEnvironments.find(
      (e) => e.project === params.projectId && e.name === params.envName,
    );
    if (!env) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(env);
  }),

  http.post(`${BASE}/admin/projects/:projectId/environments`, async ({ params, request }) => {
    const body = await request.json() as { name: string };
    return HttpResponse.json({
      project: params.projectId,
      name: body.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.delete(`${BASE}/admin/projects/:projectId/environments/:envName`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Config Entries ────────────────────────────────────────────────────────────
  http.get(`${BASE}/admin/projects/:projectId/environments/:envName/config-entries`, ({ params }) => {
    const entries = mockConfigEntries.filter(
      (c) => c.project === params.projectId && c.environment === params.envName,
    );
    return HttpResponse.json(entries);
  }),

  http.get(`${BASE}/admin/projects/:projectId/environments/:envName/config-entries/:key`, ({ params }) => {
    const entry = mockConfigEntries.find(
      (c) => c.project === params.projectId && c.environment === params.envName && c.key === params.key,
    );
    if (!entry) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(entry);
  }),

  http.put(`${BASE}/admin/projects/:projectId/environments/:envName/config-entries/:key`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockConfigEntries[0],
      project: params.projectId,
      environment: params.envName,
      key: params.key,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE}/admin/projects/:projectId/environments/:envName/config-entries/:key`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Users ─────────────────────────────────────────────────────────────────────
  http.get(`${BASE}/admin/users`, () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get(`${BASE}/admin/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.post(`${BASE}/admin/users`, async ({ request }) => {
    const body = await request.json() as { email: string; role?: string };
    return HttpResponse.json({
      id: 'user-new',
      email: body.email,
      name: body.email.split('@')[0],
      isAdmin: body.role === 'admin',
      role: body.role ?? 'viewer',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.put(`${BASE}/admin/users/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ ...user, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${BASE}/admin/users/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
