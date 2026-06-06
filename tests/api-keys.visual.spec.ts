import { expect, test } from "@playwright/test";

const apiKeys = [
  {
    id: 1,
    name: "Web Client",
    key: "A".repeat(64),
    project: "my-app",
    environment: null,
    scope: "client",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

test.use({ baseURL: "http://127.0.0.1:4174" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("auth_token", "visual-test-token");
  });

  await page.route(/\/admin\/projects/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (request.method() === "GET" && path === "/admin/projects") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "proj-1",
            urlSlug: "my-app",
            name: "my-app",
            description: "Main application config",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        ]),
      });
      return;
    }

    if (request.method() === "GET" && path === "/admin/projects/my-app/environments") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          { project: "my-app", name: "production", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
          { project: "my-app", name: "staging", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        ]),
      });
      return;
    }

    if (request.method() === "GET" && path === "/admin/projects/my-app/api-keys") {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(apiKeys) });
      return;
    }

    if (request.method() === "POST" && path === "/admin/projects/my-app/api-keys") {
      const body = JSON.parse(request.postData() || "{}");
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: 2,
          name: body.name,
          key: "C".repeat(64),
          project: "my-app",
          environment: body.environment,
          scope: body.scope,
          createdAt: "2024-01-03T00:00:00Z",
          updatedAt: "2024-01-03T00:00:00Z",
        }),
      });
      return;
    }

    if (request.method() === "DELETE" && path === "/admin/projects/my-app/api-keys/1") {
      await route.fulfill({ status: 204 });
      return;
    }

    if (request.method() === "GET" && path === "/admin/projects/my-app/environments/production/config-entries") {
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
            updatedAt: "2024-01-01T00:00:00Z",
          },
        ]),
      });
      return;
    }

    await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: "Not found" }) });
  });
});

test("project API key management is visually usable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/projects/my-app");

  await expect(page.getByRole("heading", { name: "my-app" })).toBeVisible();
  await expect(page.getByText("Web Client")).toBeVisible();
  await expect(page.getByText("A".repeat(64))).toBeVisible();

  await page.screenshot({ path: "test-results/api-keys-project-desktop.png", fullPage: true });

  await page.getByRole("button", { name: /generate api key/i }).click();
  await page.getByLabel("Name").fill("Playwright Client");
  await page.getByLabel("Environment").selectOption("production");
  await page.getByLabel("Scope").selectOption("all");
  await page.getByRole("button", { name: /^generate$/i }).click();

  await expect(page.getByText("Playwright Client")).toBeVisible();
  await expect(page.getByText("C".repeat(64))).toBeVisible();

  await page.getByTitle("Delete API key Web Client").click();
  await expect(page.getByText("Web Client")).toBeHidden();
});
