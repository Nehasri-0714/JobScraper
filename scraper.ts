// scraper.ts
// Make sure package.json has "type": "module"

import fs from 'fs';
// @ts-ignore
import puppeteer from 'puppeteer-extra';
// @ts-ignore
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function scrapeJobs() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Go to RemoteOK's job listings page
    await page.goto('https://remoteok.io/remote-dev-jobs', { waitUntil: 'networkidle2' });

    // Extract job data
    const jobs = await page.evaluate(() => {
      const jobRows = Array.from(document.querySelectorAll('tr.job')); // Each job row
      return jobRows.map(job => {
        const title = job.querySelector('h2')?.textContent?.trim() || '';
        const company = job.querySelector('.companyLink span')?.textContent?.trim() || '';
        const location = job.querySelector('.location')?.textContent?.trim() || 'Remote';
        const datePosted = job.querySelector('time')?.getAttribute('datetime') || '';
        return { title, company, location, datePosted };
      });
    });

    console.log(jobs);

    // Save jobs to JSON file
    fs.writeFileSync('jobs.json', JSON.stringify(jobs, null, 2));

    await browser.close();
    console.log('Scraping finished. Jobs saved to jobs.json');
  } catch (err) {
    console.error('Error during scraping:', err);
  }
}

// Run the scraper
scrapeJobs();
