const { test, expect } = require("@playwright/test");

function match(now, placement, daysAgo, trait, unit, augment, level, gold) {
  return {
    placement,
    playedAt: now - daysAgo * 86400000,
    setNumber: 16,
    level,
    goldLeft: gold,
    traits: [{ name: "TFT16_" + trait, style: 3, tierCurrent: 1 }],
    units: [{ characterId: "TFT16_" + unit }],
    augments: [augment]
  };
}

test("compares Top 4 and Bottom 4 patterns from personal Riot history", async ({ page }) => {
  const now=Date.now();
  const matches=[
    match(now,1,1,"Rebel","Jinx","Jeweled Lotus",9,20),
    match(now,2,2,"Rebel","Jinx","Jeweled Lotus",9,12),
    match(now,3,3,"Rebel","Jinx","Pandora Items",8,8),
    match(now,4,4,"Bastion","Garen","Jeweled Lotus",8,5),
    match(now,5,5,"Bruiser","Darius","Tiny Titans",8,4),
    match(now,6,6,"Bruiser","Darius","Tiny Titans",8,2),
    match(now,7,7,"Bruiser","Darius","Tiny Titans",7,1),
    match(now,8,8,"Rebel","Kaisa","Pandora Items",7,0)
  ];

  await page.route("**/riot-legacy-tft-profile", route => route.fulfill({
    status:200,
    contentType:"application/json",
    body:JSON.stringify({
      player:{gameName:"AlchemyFlames",tagLine:"BR1"},
      cacheMeta:{stale:false},
      matches
    })
  }));

  await page.goto("/");
  await page.locator("#riot-id").fill("AlchemyFlames#BR1");
  await page.locator("#lookup-form").getByRole("button").click();

  await expect(page.locator("#status")).toHaveText("Dados Riot carregados.");
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#player-name")).toHaveText("AlchemyFlames#BR1");
  await expect(page.locator("#metric-games")).toHaveText("8");
  await expect(page.locator("#metric-top4")).toHaveText("50%");
  await expect(page.locator("#metric-wins")).toHaveText("1");
  await expect(page.locator("#top-games")).toHaveText("4");
  await expect(page.locator("#bottom-games")).toHaveText("4");
  await expect(page.locator(".placement-col")).toHaveCount(8);
  await expect(page.locator("#confidence-badge")).toHaveText("Amostra moderada");

  await expect(page.locator("#difference-list")).toContainText("Rebel");
  await expect(page.locator("#difference-list")).toContainText("Bruiser");
  await expect(page.locator("#difference-list")).toContainText("mais no Top 4");
  await expect(page.locator("#difference-list")).toContainText("mais no Bottom 4");

  await page.locator('[data-period="set"]').click();
  await expect(page.locator("#metric-games")).toHaveText("8");
});

test("keeps validation, rate-limit and English states explicit", async ({ page }) => {
  await page.goto("/");
  await page.locator("#riot-id").fill("invalid");
  await page.locator("#lookup-form").getByRole("button").click();
  await expect(page.locator("#status")).toContainText("Nome#TAG");

  await page.route("**/riot-legacy-tft-profile", route => route.fulfill({
    status:429,contentType:"application/json",body:JSON.stringify({error:"rate_limit"})
  }));
  await page.locator("#riot-id").fill("AlchemyFlames#BR1");
  await page.locator("#lookup-form").getByRole("button").click();
  await expect(page.locator("#status")).toContainText("Limite temporário");

  await page.locator("#language-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("lang","en");
  await expect(page.locator("#lookup-form").getByRole("button")).toHaveText("Read my Placement DNA");
});

test("deep link preserves Riot ID, server, period and language", async ({ page }) => {
  const now=Date.now();
  await page.route("**/riot-legacy-tft-profile", route => route.fulfill({
    status:200,contentType:"application/json",
    body:JSON.stringify({
      player:{gameName:"AlchemyFlames",tagLine:"BR1"},
      matches:[
        match(now,2,1,"Rebel","Jinx","Jeweled Lotus",8,10),
        match(now,6,2,"Bruiser","Darius","Tiny Titans",7,2)
      ]
    })
  }));

  await page.goto("/?riot=AlchemyFlames%23BR1&server=br1&period=set&lang=en");
  await expect(page.locator("html")).toHaveAttribute("lang","en");
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator('[data-period="set"]')).toHaveClass(/active/);
  await expect(page.locator("#player-name")).toHaveText("AlchemyFlames#BR1");
});
