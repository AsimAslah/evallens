import { expect, test } from "@playwright/test";

test("opens the landing page and public showcase", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /sharper lens/i })).toBeVisible();
  await page.goto("/showcase");
  await expect(page.getByRole("heading", { name: /evaluation that can explain itself/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /GPT-1 versus GPT-2/i })).toBeVisible();
});

test("runs the demonstration evaluation locally", async ({ page }) => {
  await page.goto("/evaluations/new");
  await page.getByRole("button", { name: /load demonstration/i }).click();
  await page.getByRole("radio", { name: /response b wins/i }).click();
  await page.getByRole("button", { name: /calculate local result/i }).click();
  await expect(page.getByRole("heading", { name: /response b wins/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: /compare two responses/i })).toBeVisible();
});

test("exposes keyboard and screen-reader navigation semantics", async ({ page }) => {
  await page.goto("/dashboard");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await expect(page.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  const theme = page.getByRole("button", { name: /switch to (dark|light) color theme/i });
  await theme.click();
  await expect(theme).toHaveAttribute("aria-pressed", /true|false/);
});

test("creates, applies, saves, edits, and deletes a custom-rubric evaluation", async ({ page, request }) => {
  const token = process.env.ADMIN_API_TOKEN;
  test.skip(!token, "owner token required");
  expect((await request.get("/api/export?format=csv")).status()).toBe(401);

  const run = Date.now();
  const rubricName = `E2E focused rubric ${run}`;
  const title = `E2E evaluation ${run}`;
  const rubricResponse = await request.post("/api/rubrics", {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: rubricName,
      description: "Synthetic rubric for isolated browser integration testing.",
      criteria: [
        { name: "Accuracy", description: "Claims are correct and supportable.", weight: 3 },
        { name: "Clarity", description: "Writing is direct and understandable.", weight: 1 }
      ]
    }
  });
  expect(rubricResponse.status()).toBe(201);
  const rubricId = (await rubricResponse.json()).id;
  let recordId = "";

  try {
    await page.addInitScript((value) => sessionStorage.setItem("evallens-owner-token", value), token!);
    await page.goto("/evaluations/new");
    await page.getByRole("button", { name: /load demonstration/i }).click();
    await page.getByLabel("Evaluation title").fill(title);
    await page.getByLabel("Evaluation rubric").selectOption(rubricId);
    await page.getByRole("button", { name: /calculate local result/i }).click();
    await expect(page.getByRole("heading", { name: /response b wins/i })).toBeVisible();
    await page.getByRole("button", { name: /save to d1/i }).click();
    await expect(page.getByRole("status")).toContainText("Saved evaluation");

    const list = await request.get("/api/evaluations", { headers: { Authorization: `Bearer ${token}` } });
    const record = (await list.json()).evaluations.find((item: { title: string }) => item.title === title);
    recordId = record.id;
    expect(record.rubricId).toBe(rubricId);
    expect(record.rubricCriteria).toHaveLength(2);
    expect(record.isPublished).toBe(true);
    expect((await request.get(`/api/evaluations/${recordId}`)).status()).toBe(200);

    const invalidRubric = await request.post("/api/evaluations", {
      headers: { Authorization: `Bearer ${token}` },
      data: { ...record, title: `${title} invalid rubric`, rubricId: "missing-rubric", attachments: [] }
    });
    expect(invalidRubric.status()).toBe(400);
    const invalidCriterion = await request.post("/api/evaluations", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        ...record,
        title: `${title} invalid criterion`,
        scores: record.scores.map((score: { criterionId: string }, index: number) => index === 0 ? { ...score, criterionId: "unknown-criterion" } : score),
        attachments: []
      }
    });
    expect(invalidCriterion.status()).toBe(400);
    expect((await request.get("/api/export?format=csv", { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(200);
    expect((await request.get("/api/export?format=json", { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(200);
    expect((await request.get("/api/analytics", { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(200);

    const unpublish = await request.put(`/api/evaluations/${recordId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { ...record, isPublished: false, attachments: [] }
    });
    expect(unpublish.status()).toBe(200);
    const privateRecord = (await unpublish.json()).evaluation;
    expect((await request.get(`/api/evaluations/${recordId}`)).status()).toBe(404);
    expect((await request.get(`/api/evaluations/${recordId}`, { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(200);

    const update = await request.put(`/api/evaluations/${recordId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { ...privateRecord, isPublished: true, finalNotes: "Edited during isolated E2E verification.", attachments: [] }
    });
    expect(update.status()).toBe(200);
    expect((await update.json()).evaluation.rubricCriteria[0].weight).toBe(3);

    const today = new Date().toISOString().slice(0, 10);
    const filtered = await request.get(`/api/evaluations?search=${encodeURIComponent(title)}&winner=b&model=Response%20B&from=${today}&to=${today}`, { headers: { Authorization: `Bearer ${token}` } });
    expect((await filtered.json()).evaluations.some((item: { id: string }) => item.id === recordId)).toBe(true);
    await page.goto("/evaluations/history");
    await page.getByPlaceholder("Search title or prompt").fill(title);
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible();
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Evaluation analytics" })).toBeVisible();

    expect((await request.delete(`/api/evaluations/${recordId}`, { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(204);
    recordId = "";
  } finally {
    if (recordId) await request.delete(`/api/evaluations/${recordId}`, { headers: { Authorization: `Bearer ${token}` } });
  }
});

test("supports mobile navigation without horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("link", { name: "Rubrics" }).click();
  await expect(page.getByRole("heading", { name: "Rubric library" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
