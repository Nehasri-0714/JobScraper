import fs from "fs";

// Use "any" to avoid TS type errors
const puppeteerExtra: any = await import("puppeteer-extra").then(m => m.default);
const StealthPlugin: any = await import("puppeteer-extra-plugin-stealth").then(m => m.default);

// Add stealth plugin
puppeteerExtra.use(StealthPlugin());

async function scrapeJobs() {
  try {
    const browser: any = await puppeteerExtra.launch({ headless: true });
    const page: any = await browser.newPage();

    // Navigate to RemoteOK job listings
    await page.goto("https://remoteok.io/remote-dev-jobs", {
      waitUntil: "networkidle2",
    });

    // Extract job data
    const jobs: any[] = await page.evaluate(() => {
      const jobRows = Array.from(document.querySelectorAll("tr.job"));
      return jobRows.map(job => ({
        title: job.querySelector("h2")?.textContent?.trim() || "",
        company: job.querySelector(".companyLink span")?.textContent?.trim() || "",
        location: job.querySelector(".location")?.textContent?.trim() || "Remote",
        datePosted: job.querySelector("time")?.getAttribute("datetime") || ""
      }));
    });

    // Save jobs to JSON
    fs.writeFileSync("jobs.json", JSON.stringify(jobs, null, 2));

    await browser.close();
    console.log("✅ Scraping finished. Jobs saved to jobs.json");
  } catch (err) {
    console.error("❌ Error during scraping:", err);
  }
}

scrapeJobs();
