// scraper.ts
import fs from "fs";
import path from "path";

async function scrapeJobs() {
  try {
    // Treat puppeteer-extra as "any" to avoid TS errors
    const puppeteerExtra: any = (await import("puppeteer-extra")).default;
    const StealthPlugin: any = (await import("puppeteer-extra-plugin-stealth")).default;

    puppeteerExtra.use(StealthPlugin());

    const browser: any = await puppeteerExtra.launch({ headless: true });
    const page: any = await browser.newPage();

    await page.goto("https://remoteok.io/remote-dev-jobs", { waitUntil: "networkidle2" });

    const jobs: any[] = await page.evaluate(() => {
      const jobRows = Array.from(document.querySelectorAll("tr.job"));
      return jobRows.map(job => ({
        title: job.querySelector("h2")?.textContent?.trim() || "",
        company: job.querySelector(".companyLink span")?.textContent?.trim() || "",
        location: job.querySelector(".location")?.textContent?.trim() || "Remote",
        datePosted: job.querySelector("time")?.getAttribute("datetime") || ""
      }));
    });

    // Save jobs.json in repo root
    const outputPath = path.resolve(process.cwd(), "jobs.json");
    fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2));

    console.log(`✅ Scraping finished. Jobs saved to ${outputPath}`);

    await browser.close();
  } catch (err) {
    console.error("❌ Error during scraping:", err);
  }
}

scrapeJobs();
