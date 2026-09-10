import { chromium } from "playwright";

const email = `pl${Date.now()}@zw.test`;
const password = "Paperdesk1";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "pl-PL" });
const page = await context.newPage();
page.setDefaultTimeout(25000);

async function shot(name) {
  await page.screenshot({ path: `/workspace/screenshots/${name}`, fullPage: false });
  console.log("shot", name, page.url());
}

await page.goto("http://127.0.0.1:8080/login", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.setItem("zw-locale", "pl"));
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForSelector("#login-email");
await shot("pl-login.png");
const loginText = await page.locator("body").innerText();
if (!/Załóż konto|Zaloguj/.test(loginText)) throw new Error("login not Polish: " + loginText.slice(0, 200));
if (/fille|desk zapisywał|heurystyk|Model floor|flooru|lokalne heur/.test(loginText)) throw new Error("cringe still on login");

await page.getByRole("button", { name: /Nie masz konta|Załóż/i }).click();
await page.fill("#login-email", email);
await page.fill("#login-password", password);
await page.click("button[type=submit]");
await page.waitForURL((u) => u.pathname === "/", { timeout: 20000 });
const tour = page.locator("[data-desk-tour=open]");
try {
  await tour.waitFor({ timeout: 8000 });
  await page.getByRole("button", { name: /Pomiń/i }).click();
  await tour.waitFor({ state: "detached", timeout: 5000 });
} catch { console.log("no tour"); }
await page.waitForTimeout(800);
await shot("pl-desk.png");
const desk = await page.locator("body").innerText();
console.log("has Demo", /Demo/.test(desk), "has Na żywo", /Na żywo/.test(desk), "has Agenci", /Agenci/.test(desk));
if (!/Demo/.test(desk) || !/Na żywo/.test(desk)) throw new Error("mode switch missing");
if (!/Przejdź na żywo/.test(desk)) throw new Error("demo go-live CTA missing");
if (/heurystyk|Model floor|flooru|lokalne heur|Taśma/.test(desk)) throw new Error("cringe still on desk: " + desk.slice(0, 400));

await page.getByRole("button", { name: /^Na żywo$/ }).click();
await page.waitForTimeout(400);
await shot("pl-live-gate.png");
const gate = await page.locator("body").innerText();
if (!/MetaMask/.test(gate)) throw new Error("live gate missing MM");

await page.keyboard.press("Escape");
await page.getByRole("button", { name: /Agenci/i }).click();
await page.waitForTimeout(300);
await shot("pl-floor.png");

console.log("OK", email);
await browser.close();
