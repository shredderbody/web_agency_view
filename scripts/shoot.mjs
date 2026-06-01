import { chromium } from "playwright";

const BASE = process.env.SHOOT_BASE || "http://localhost:3210";
const pages = [
  { slug: "home", path: "/" },
  { slug: "demo", path: "/demo" },
  { slug: "barber", path: "/demo/barbershop" },
  { slug: "onglerie", path: "/demo/onglerie" },
  { slug: "traiteur", path: "/demo/traiteur" },
  { slug: "resto", path: "/demo/restaurant" },
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1280, height: 900 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.addStyleTag({ content: ".reveal{opacity:1 !important; animation:none !important; transform:none !important;}" });
    await page.waitForTimeout(700);
    const out = `/tmp/shot-${p.slug}-${vp.name}.png`;
    await page.screenshot({ path: out, fullPage: true });
    console.log("shot", out);
  }
  await page.close();
}
await browser.close();
