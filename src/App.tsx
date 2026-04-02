import { type Component, lazy } from "solid-js";
import { Router, Route, Navigate } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authService } from "./services/auth.service";
import { ToastProvider } from "./components/ui/toast";
import "./App.css";
import { MetaProvider, Title } from "@solidjs/meta";

// Lazy load pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ProjectsPage = lazy(() => import("./pages/projects/ProjectsPage"));
const ProjectPage = lazy(() => import("./pages/projects/ProjectPage"));
const UsersPage = lazy(() => import("./pages/users/UsersPage"));
const UserPage = lazy(() => import("./pages/users/UserPage"));
const ConfigEntriesPage = lazy(() => import("./pages/config-entries/ConfigEntriesPage"));
const EnvironmentsPage = lazy(() => import("./pages/environments/EnvironmentsPage"));
const AuditLogsPage = lazy(() => import("./pages/audit-logs/AuditLogsPage"));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: Component<{ component: Component }> = (props) => {
  if (!authService.isAuthenticated()) {
    return <Navigate href="/login" />;
  }
  return <props.component />;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute: Component<{ component: Component }> = (props) => {
  if (authService.isAuthenticated()) {
    return <Navigate href="/dashboard" />;
  }
  return <props.component />;
};

const App: Component = () => {
  return (
    <MetaProvider>
    <Title>Nona Config Admin</Title>
      <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Router>
              <Route path="/" component={() => <Navigate href="/dashboard" />} />
              <Route path="/login" component={() => <PublicRoute component={LoginPage} />} />
              <Route path="/register" component={() => <PublicRoute component={RegisterPage} />} />
              <Route path="/forgot-password" component={() => <PublicRoute component={ForgotPasswordPage} />} />
              <Route path="/projects" component={() => <ProtectedRoute component={ProjectsPage} />} />
              <Route path="/projects/:slug" component={() => <ProtectedRoute component={ProjectPage} />} />
              <Route path="/users" component={() => <ProtectedRoute component={UsersPage} />} />
              <Route path="/user" component={() => <ProtectedRoute component={UserPage} />} />
              <Route path="/config-entries" component={() => <ProtectedRoute component={ConfigEntriesPage} />} />
              <Route path="/environments" component={() => <ProtectedRoute component={EnvironmentsPage} />} />
              <Route path="/audit-logs" component={() => <ProtectedRoute component={AuditLogsPage} />} />
            </Router>
          </ToastProvider>
      </QueryClientProvider>
    </MetaProvider>
  );
};

export default App
