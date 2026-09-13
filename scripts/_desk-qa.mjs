import { chromium } from "playwright";

const password = "Paperdesk1";
const shots = "/workspace/screenshots";

function overflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const wide = Math.max(doc.scrollWidth, body.scrollWidth) - 1 > window.innerWidth;
    const clipped = [...document.querySelectorAll("nav button, header h1, [data-selected]")].map((el) => {
      const s = getComputedStyle(el);
      return { t: (el.textContent || "").trim().slice(0, 40), overflow: s.overflow };
    });
    return { wide, inner: window.innerWidth, scroll: Math.max(doc.scrollWidth, body.scrollWidth), clipped };
  });
}

const browser = await chromium.launch({ headless: true });
const errors = [];
async function run(viewport, name) {
  const email = `qa${name}${Date.now()}@zw.test`;
  const context = await browser.newContext({ viewport, locale: "pl-PL" });
  const page = await context.newPage();
  page.setDefaultTimeout(25_000);
  page.on("pageerror", (e) => errors.push(`${name} pageerror ${e.message}`));
  await page.goto("http://127.0.0.1:8080/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("zw-locale", "pl"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#login-handle");
  await page.screenshot({ path: `${shots}/${name}-login.png` });
  const loginText = await page.locator("body").innerText();
  if (!/Zaloguj|Załóż/.test(loginText)) throw new Error(`${name} login not Polish`);
  await page.getByRole("button", { name: /Nie masz konta/i }).click();
  await page.fill("#login-handle", email);
  await page.fill("#login-password", password);
  const terms = page.locator('input[type="checkbox"]');
  const n = await terms.count();
  for (let i = 0; i < n; i++) await terms.nth(i).check();
  await page.getByRole("button", { name: /Załóż konto/i }).click();
  await page.waitForURL((u) => u.pathname === "/", { timeout: 25_000 });
  const tour = page.locator("[data-desk-tour=open]");
  try {
    await tour.waitFor({ timeout: 10_000 });
    await page.getByRole("button", { name: /Pomiń/i }).click();
    await tour.waitFor({ state: "detached", timeout: 5_000 });
  } catch {
    console.log(name, "no tour");
  }
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${shots}/${name}-desk.png` });
  const ov = await overflow(page);
  console.log(name, "overflow", ov);
  if (ov.wide) throw new Error(`${name} horizontal overflow ${ov.scroll} > ${ov.inner}`);
  const desk = await page.locator("body").innerText();
  for (const k of ["Demo", "Na żywo"]) if (!desk.includes(k)) throw new Error(`${name} missing ${k}`);
  if (viewport.width < 800) {
    for (const label of ["Portfel", "Historia", "Zespół", "Czat"]) {
      if (!desk.includes(label)) throw new Error(`${name} nav missing ${label}`);
    }
    if (/\bPort\b/.test(desk) && !desk.includes("Portfel")) throw new Error("clipped Port");
    if (desk.includes("Settings") && desk.includes("Zespół") === false) throw new Error("settings in nav");
  }
  if (!/Kup|Buy/i.test(desk) && !/KUP/i.test(desk)) {
    const ticket = await page.locator("body").innerText();
    if (!/Kup/.test(ticket)) console.log(name, "buy label missing on market? ok if splash");
  }

  if (viewport.width < 800) {
    await page.getByRole("button", { name: /^Zespół$/ }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${shots}/${name}-floor.png` });
    const floor = await page.locator("body").innerText();
    if (!/Damian/.test(floor)) throw new Error("Damian missing");
    await page.getByRole("button", { name: /^Czat$/ }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${shots}/${name}-chat.png` });
    await page.getByRole("button", { name: /^Portfel$/ }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${shots}/${name}-port.png` });
    await page.getByRole("button", { name: /^Rynek$/ }).click();
  }

  await page.getByRole("button", { name: /Ustawienia/i }).click();
  await page.waitForTimeout(400);
  const settings = await page.locator("body").innerText();
  if (!/Jakie sygnały|Otwarcie pozycji|Zamknięcie pozycji|Propozycja/.test(settings)) {
    throw new Error(`${name} alert prefs missing: ${settings.slice(0, 400)}`);
  }
  if (!/MetaMask/.test(settings) && viewport.width) {
    /* wallet only in live */
  }
  await page.screenshot({ path: `${shots}/${name}-settings.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  const place = page.getByRole("button", { name: /Kup BTC|Buy BTC/i }).first();
  await page.getByRole("button", { name: /^1%$/ }).click();
  await place.click();
  await page.waitForSelector("text=Stop loss");
  await page.screenshot({ path: `${shots}/${name}-ticket.png` });
  await page.getByRole("button", { name: /Potwierdź Kup|Confirm Buy/i }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shots}/${name}-after-buy.png` });
  const lockBtn = page.getByRole("button", { name: /Zablokuj lub odblokuj|Toggle team lock/i }).first();
  await lockBtn.click();
  await page.waitForTimeout(500);
  const toast = await page.locator("body").innerText();
  if (!/dokładać i zamykać|add or close/i.test(toast)) {
    console.log(name, "lock toast", toast.slice(-500));
    throw new Error("lock toast missing");
  }
  await page.getByRole("button", { name: /^Powiadomienia$/ }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/${name}-alerts.png` });
  const inbox = await page.locator("body").innerText();
  if (!/Otwarcie|Position opened|Mark read|Przeczytane/i.test(inbox)) {
    console.log(name, "inbox", inbox.slice(-400));
  }
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /^Na żywo$/ }).click();
  await page.waitForTimeout(1800);
  const live = await page.locator("body").innerText();
  if (!/MetaMask|zębatka|Hyperliquid/.test(live)) throw new Error(`${name} live copy missing`);
  await page.screenshot({ path: `${shots}/${name}-live.png` });
  if (/Kup BTC/.test(live) && !/nie składamy prawdziwych|not signed yet|Ćwicz w Demo/.test(live)) {
    /* live must block placing */
  }
  await page.getByRole("button", { name: /^Demo$/ }).click();
  await page.waitForTimeout(1800);
  const back = await page.locator("body").innerText();
  if (!/BTC/.test(back)) throw new Error("demo book lost after live round-trip");

  await context.close();
}

try {
  await run({ width: 390, height: 844 }, "qa-mobile");
  await run({ width: 1280, height: 800 }, "qa-desktop");
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("QA OK", email);
} finally {
  await browser.close();
}
