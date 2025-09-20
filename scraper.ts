import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

async function scrapeJobs() {
  try {
    // Ensure the output directory exists
    const outputDir = path.resolve(process.cwd(), "dist");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Launch Puppeteer with flags for CI/Linux environments
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
      ],
      executablePath: process.env.CHROME_PATH || undefined, // optional system Chromium
    });

    const page = await browser.newPage();

    await page.goto("https://remoteok.io/remote-dev-jobs", {
      waitUntil: "networkidle2",
    });

    const jobs = await page.evaluate(() => {
      const jobRows = Array.from(document.querySelectorAll("tr.job"));
      return jobRows.map((job) => ({
        title: job.querySelector("h2")?.textContent?.trim() || "",
        company: job.querySelector(".companyLink span")?.textContent?.trim() || "",
        location: job.querySelector(".location")?.textContent?.trim() || "Remote",
        datePosted: job.querySelector("time")?.getAttribute("datetime") || "",
      }));
    });

    const outputPath = path.resolve(outputDir, "jobs.json");
    fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2));
    console.log(`✅ Scraping finished. Jobs saved to ${outputPath}`);

    await browser.close();
  } catch (err) {
    console.error("❌ Error during scraping:", err);
  }
}

scrapeJobs();
