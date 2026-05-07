const { chromium } = require('playwright');
const fs = require('fs');

(async () => {

    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage();

    const url = 'https://r.parkee.app/?l=164&ps=BAC7972F';

    await page.goto(url, {
        waitUntil: 'networkidle'
    });

    await page.waitForTimeout(10000);

    const today = new Date()
        .toISOString()
        .replace(/[:.]/g, '-');

    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }

    // save screenshot
    await page.screenshot({
        path: `output/${today}.png`,
        fullPage: true
    });

    // save rendered html
    const html = await page.content();

    fs.writeFileSync(
        `output/${today}.html`,
        html
    );

    await browser.close();
})();