import { type Component, lazy } from "solid-js";
import { Router, Route, Navigate } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authService } from "./services/auth.service";
import { ToastProvider } from "./components/ui/toast";
import { PageTitleProvider } from "./contexts/PageTitleContext";
import "./App.css";

// Lazy load pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const ProjectsPage = lazy(() => import("./pages/projects/ProjectsPage"));
const UsersPage = lazy(() => import("./pages/users/UsersPage"));
const UserPage = lazy(() => import("./pages/users/UserPage"));
const ConfigEntriesPage = lazy(() => import("./pages/config-entries/ConfigEntriesPage"));
const EnvironmentsPage = lazy(() => import("./pages/environments/EnvironmentsPage"));

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
    <QueryClientProvider client={queryClient}>
      <PageTitleProvider>
        <ToastProvider>
          <Router>
            <Route path="/" component={() => <Navigate href="/dashboard" />} />
            <Route path="/login" component={() => <PublicRoute component={LoginPage} />} />
            <Route path="/register" component={() => <PublicRoute component={RegisterPage} />} />
            <Route path="/forgot-password" component={() => <PublicRoute component={ForgotPasswordPage} />} />
            <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
            <Route path="/projects" component={() => <ProtectedRoute component={ProjectsPage} />} />
            <Route path="/users" component={() => <ProtectedRoute component={UsersPage} />} />
            <Route path="/user" component={() => <ProtectedRoute component={UserPage} />} />
            <Route path="/config-entries" component={() => <ProtectedRoute component={ConfigEntriesPage} />} />
            <Route path="/environments" component={() => <ProtectedRoute component={EnvironmentsPage} />} />
          </Router>
        </ToastProvider>
      </PageTitleProvider>
    </QueryClientProvider>
  );
};

export default App
