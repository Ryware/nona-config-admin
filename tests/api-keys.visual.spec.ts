import { expect, test } from "@playwright/test";

const initialProject = {
  id: "proj-1",
  urlSlug: "my-app",
  name: "my-app",
  description: "Main application config",
  serverApiKey: "srv_" + "A".repeat(24),
  clientApiKey: "cli_" + "B".repeat(24),
  environments: ["production", "staging"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("auth_token", "visual-test-token");
    localStorage.setItem(
      "auth_session",
      JSON.stringify({ email: "admin@example.com", role: "Admin" })
    );
  });

  let project = { ...initialProject };

  await page.route(/\/admin\/projects/, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (request.method() === "GET" && path === "/admin/projects") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([project])
      });
      return;
    }

    if (request.method() === "GET" && path === "/admin/projects/my-app/environments") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          {
            project: "my-app",
            name: "production",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          },
          {
            project: "my-app",
            name: "staging",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          }
        ])
      });
      return;
    }

    if (request.method() === "POST" && path === "/admin/projects/my-app/reroll-keys") {
      const body = JSON.parse(request.postData() || "{}");
      project = {
        ...project,
        serverApiKey: body.keyType === "Server" ? "srv_" + "C".repeat(24) : project.serverApiKey,
        clientApiKey: body.keyType === "Client" ? "cli_" + "D".repeat(24) : project.clientApiKey,
        updatedAt: "2024-01-03T00:00:00Z"
      };

      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(project)
      });
      return;
    }

    if (
      request.method() === "GET" &&
      path === "/admin/projects/my-app/environments/production/config-entries"
    ) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          {
            project: "my-app",
            environment: "production",
            key: "API_URL",
            value: "https://api.example.com",
            contentType: "string",
            scope: "all",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          }
        ])
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Not found" })
    });
  });
});

test("project API key management is visually usable", async ({ page }, testInfo) => {
  await page.goto("/projects/my-app");

  await expect(page.getByTestId("project-detail-heading")).toBeVisible();
  await expect(page.getByTestId("project-api-keys-heading")).toBeVisible();
  await expect(page.getByTestId("server-key-label")).toBeVisible();
  await expect(page.getByTestId("client-key-label")).toBeVisible();
  await expect(page.getByTestId("environment-tab-production")).toBeVisible();
  await expect(page.getByTestId("parameter-key-API_URL")).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("api-keys-project.png"), fullPage: true });

  await page.getByTestId("client-key-toggle-button").click();
  await expect(page.getByTestId("client-key-value")).toContainText(initialProject.clientApiKey);

  await page.getByTestId("client-key-reroll-button").click();
  await expect(page.getByTestId("client-key-value")).toContainText("cli_" + "D".repeat(24));
});
