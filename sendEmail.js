const fs = require('fs');
const nodemailer = require('nodemailer');

(async () => {

    const result = JSON.parse(
        fs.readFileSync('state/result.json', 'utf8')
    );

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    let subject = '';
    let html = '';

    if (result.status === 'NEW_RECEIPT') {

        subject = '[SUCCESS] New Parkee Receipt';

        html = `
            <h2>New Receipt Detected</h2>

            <p><b>Date:</b> ${result.date}</p>
            <p><b>Amount:</b> IDR ${result.amount}</p>

            <p>
                <a href="${result.dropboxLink}">
                    Open Dropbox File
                </a>
            </p>
        `;

    } else {

        subject = '[INFO] No New Parkee Receipt';

        html = `
            <h2>No New Receipt</h2>

            <p>Workflow executed successfully.</p>

            <p>
                Latest receipt is still the same as previous run.
            </p>

            <p><b>Date:</b> ${result.date}</p>
            <p><b>Amount:</b> IDR ${result.amount}</p>
        `;
    }

    await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: process.env.GMAIL_EMAIL,
        subject,
        html
    });

    console.log('EMAIL SENT');

})();