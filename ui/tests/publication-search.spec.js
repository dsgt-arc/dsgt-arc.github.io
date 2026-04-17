import { test, expect } from "@playwright/test";

test.describe("Publication search and filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/publications/");
  });

  test("page loads with search controls visible", async ({ page }) => {
    await expect(
      page.getByRole("searchbox", { name: "Search publications" }),
    ).toBeVisible();
    await expect(page.getByLabel("Filter by year")).toBeVisible();
    await expect(page.getByLabel("Filter by venue")).toBeVisible();
  });

  test("static fallback list is hidden when component mounts", async ({
    page,
  }) => {
    const staticList = page.locator("#pub-list-static");
    await expect(staticList).toBeHidden();
  });

  test("shows all publications by default", async ({ page }) => {
    // No "Showing X of Y" message when unfiltered
    await expect(page.locator("pub-search")).not.toContainText("Showing");
    // Publications should be visible
    await expect(page.locator("pub-search li").first()).toBeVisible();
  });

  test("search filters publications by title", async ({ page }) => {
    const searchbox = page.getByRole("searchbox", {
      name: "Search publications",
    });
    await searchbox.fill("BirdCLEF");

    await expect(page.locator("pub-search")).toContainText(/Showing \d+ of/);
    await expect(page.locator("pub-search")).toContainText("BirdCLEF");
  });

  test("search filters publications by author name", async ({ page }) => {
    const searchbox = page.getByRole("searchbox", {
      name: "Search publications",
    });
    await searchbox.fill("Anthony Miyaguchi");

    await expect(page.locator("pub-search")).toContainText(/Showing \d+ of/);
    await expect(page.locator("pub-search li").first()).toBeVisible();
  });

  test("year filter shows only publications from selected year", async ({
    page,
  }) => {
    await page.getByLabel("Filter by year").selectOption("2022");

    await expect(page.locator("pub-search")).toContainText(/Showing \d+ of/);
    // Only CLEF 2022 heading should be visible
    await expect(page.locator("pub-search h2")).toHaveCount(1);
    await expect(page.locator("pub-search h2").first()).toContainText("2022");
  });

  test("venue filter shows only publications from selected venue", async ({
    page,
  }) => {
    await page.getByLabel("Filter by venue").selectOption("TREC");

    await expect(page.locator("pub-search")).toContainText(/Showing \d+ of/);
    await expect(page.locator("pub-search h2").first()).toContainText("TREC");
  });

  test("combined year and venue filter", async ({ page }) => {
    await page.getByLabel("Filter by year").selectOption("2025");
    await page.getByLabel("Filter by venue").selectOption("CLEF");

    await expect(page.locator("pub-search")).toContainText(/Showing \d+ of/);
    // All visible headings should be CLEF 2025
    const headings = page.locator("pub-search h2");
    await expect(headings).toHaveCount(1);
    await expect(headings.first()).toContainText("CLEF 2025");
  });

  test("search combined with filter", async ({ page }) => {
    await page.getByLabel("Filter by year").selectOption("2024");
    await page
      .getByRole("searchbox", { name: "Search publications" })
      .fill("plant");

    await expect(page.locator("pub-search")).toContainText(/Showing \d+ of/);
    await expect(page.locator("pub-search li").first()).toBeVisible();
  });

  test("no results shows empty state message", async ({ page }) => {
    await page
      .getByRole("searchbox", { name: "Search publications" })
      .fill("xyznonexistentquery");

    await expect(page.locator("pub-search")).toContainText("Showing 0 of");
    await expect(page.locator("pub-search")).toContainText(
      "No publications match your search",
    );
  });

  test("clearing search restores all publications", async ({ page }) => {
    const searchbox = page.getByRole("searchbox", {
      name: "Search publications",
    });

    // Filter first
    await searchbox.fill("BirdCLEF");
    await expect(page.locator("pub-search")).toContainText(/Showing \d+ of/);

    // Clear
    await searchbox.fill("");
    await expect(page.locator("pub-search")).not.toContainText("Showing");
  });

  test("year dropdown is populated with correct options", async ({ page }) => {
    const yearSelect = page.getByLabel("Filter by year");
    const options = yearSelect.locator("option");

    // "All years" + at least 2022-2025
    await expect(options.first()).toHaveText("All years");
    await expect(options).toHaveCount(5); // All years, 2025, 2024, 2023, 2022
  });

  test("venue dropdown is populated with correct options", async ({ page }) => {
    const venueSelect = page.getByLabel("Filter by venue");
    const options = venueSelect.locator("option");

    await expect(options.first()).toHaveText("All venues");
    // At least CLEF, MediaEval, TREC
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(4); // All venues + 3 venues
  });

  test("publication entries have links", async ({ page }) => {
    // Check that at least some publications have paper/preprint links
    const links = page.locator("pub-search li a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("publication entries show author names", async ({ page }) => {
    // First publication should have author names (not slugs)
    const firstPub = page.locator("pub-search li").first();
    // Author names should not contain hyphens typical of slugs
    const text = await firstPub.textContent();
    expect(text).not.toMatch(/[a-z]+-[a-z]+-[a-z]+/);
  });
});
