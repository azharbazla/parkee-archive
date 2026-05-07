const { chromium } = require('playwright');
const nodemailer = require('nodemailer');
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

    // tunggu render
    await page.waitForTimeout(8000);

    // tunggu download
    const downloadPromise = page.waitForEvent('download');

    // klik tombol download
    await page.getByText('DOWNLOAD').click();

    // ambil hasil download
    const download = await downloadPromise;

    const fileName = await download.suggestedFilename();

    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }

    const filePath = `output/${fileName}`;

    await download.saveAs(filePath);

    console.log('Downloaded:', filePath);

    await browser.close();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: process.env.GMAIL_EMAIL,
        subject: `Parkee Receipt ${new Date().toISOString()}`,
        text: 'Attached receipt download.',
        attachments: [
            {
                filename: fileName,
                path: filePath
            }
        ]
    });

    console.log('Email sent.');

})();