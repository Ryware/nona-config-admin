import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { A } from "@solidjs/router";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div class="space-y-8">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p class="mt-2 text-gray-600">Manage your configuration projects, environments, and settings</p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <A href="/projects" class="group">
            <Card class="h-full transition-all hover:shadow-md hover:border-primary-200">
              <CardHeader>
                <CardTitle class="group-hover:text-primary-700 transition-colors">Projects</CardTitle>
                <CardDescription>Manage your configuration projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-gray-600">
                  View and manage all your configuration projects, environments, and config entries.
                </p>
              </CardContent>
            </Card>
          </A>

          <A href="/config-entries" class="group">
            <Card class="h-full transition-all hover:shadow-md hover:border-primary-200">
              <CardHeader>
                <CardTitle class="group-hover:text-primary-700 transition-colors">Config Entries</CardTitle>
                <CardDescription>Manage configuration values</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-gray-600">
                  Create and manage key-value configuration entries for your applications.
                </p>
              </CardContent>
            </Card>
          </A>

          <A href="/environments" class="group">
            <Card class="h-full transition-all hover:shadow-md hover:border-primary-200">
              <CardHeader>
                <CardTitle class="group-hover:text-primary-700 transition-colors">Environments</CardTitle>
                <CardDescription>Manage project environments</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-gray-600">
                  Set up different environments like Development, Staging, and Production.
                </p>
              </CardContent>
            </Card>
          </A>

          <A href="/users" class="group">
            <Card class="h-full transition-all hover:shadow-md hover:border-primary-200">
              <CardHeader>
                <CardTitle class="group-hover:text-primary-700 transition-colors">Users</CardTitle>
                <CardDescription>Manage system users</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-gray-600">
                  Create, view, and manage users who have access to the system.
                </p>
              </CardContent>
            </Card>
          </A>

          <Card class="h-full border-dashed">
            <CardHeader>
              <CardTitle class="text-gray-500">API Access</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-gray-500">
                Configure API access for your applications to retrieve configurations.
              </p>
            </CardContent>
          </Card>

          <Card class="h-full border-dashed">
            <CardHeader>
              <CardTitle class="text-gray-500">Documentation</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-gray-500">
                View documentation and examples for integrating with your apps.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
