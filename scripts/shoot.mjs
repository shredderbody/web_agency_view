import { chromium } from "playwright";

const shots = [
  { url: "http://localhost:3210/", out: "/tmp/shot-home.png", full: true },
  { url: "http://localhost:3210/demo/barbershop", out: "/tmp/shot-barber.png", full: true },
  { url: "http://localhost:3210/demo/onglerie", out: "/tmp/shot-onglerie.png", full: true },
  { url: "http://localhost:3210/demo/traiteur", out: "/tmp/shot-traiteur.png", full: true },
  { url: "http://localhost:3210/demo/restaurant", out: "/tmp/shot-resto.png", full: true },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
for (const s of shots) {
  await page.goto(s.url, { waitUntil: "networkidle", timeout: 30000 });
  await page.addStyleTag({ content: ".reveal{opacity:1 !important; animation:none !important;}" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: s.out, fullPage: s.full });
  console.log("shot", s.out);
}
await browser.close();
