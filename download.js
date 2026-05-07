const { chromium } = require('playwright');
const fs = require('fs');

(async () => {

    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext({
        acceptDownloads: true
    });

    const page = await context.newPage();

    const url = 'https://r.parkee.app/?l=164&ps=BAC7972F';

    await page.goto(url, {
        waitUntil: 'networkidle'
    });

    await page.waitForTimeout(8000);

    // ambil text halaman
    const bodyText = await page.textContent('body');

    // extract amount
    const amountMatch = bodyText.match(/IDR\s?([\d,.]+)/i);

    // extract date
    const dateMatch = bodyText.match(
        /\d{2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mei|Agu|Okt|Des)\s\d{4}/i
    );

    const amount = amountMatch
        ? amountMatch[1].replace(/[.,]/g, '')
        : '';

    const receiptDate = dateMatch
        ? dateMatch[0]
        : '';

    console.log('DATE:', receiptDate);
    console.log('AMOUNT:', amount);

    // load previous state
    const statePath = 'state/last_receipt.json';

    const previousState = JSON.parse(
        fs.readFileSync(statePath, 'utf-8')
    );

    console.log('PREVIOUS:', previousState);

    // compare
    const isSame =
        previousState.date === receiptDate &&
        previousState.amount === amount;

    if (isSame) {

        console.log('NO NEW RECEIPT');

        fs.writeFileSync(
            'state/result.json',
            JSON.stringify({
                status: 'NO_CHANGE',
                date: receiptDate,
                amount: amount
            }, null, 2)
        );

        await browser.close();
        process.exit(0);
    }

    // DOWNLOAD RECEIPT
    const downloadPromise = page.waitForEvent('download');

    await page.getByText('DOWNLOAD').click();

    const download = await downloadPromise;

    const fileName = await download.suggestedFilename();

    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }

    const filePath = `output/${fileName}`;

    await download.saveAs(filePath);

    console.log('DOWNLOADED:', filePath);

    // update state
    fs.writeFileSync(
        statePath,
        JSON.stringify({
            date: receiptDate,
            amount: amount
        }, null, 2)
    );

    // save runtime result
    fs.writeFileSync(
        'state/result.json',
        JSON.stringify({
            status: 'NEW_RECEIPT',
            date: receiptDate,
            amount: amount,
            file: filePath
        }, null, 2)
    );

    await browser.close();

})();