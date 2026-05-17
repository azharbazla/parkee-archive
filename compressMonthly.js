const fs = require('fs');
const archiver = require('archiver');

(async () => {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, '0');

    const sourceDir = `receipts/${year}/${month}`;

    if (!fs.existsSync(sourceDir)) {

        console.log('NO MONTHLY FOLDER');
        process.exit(0);
    }

    if (!fs.existsSync('archives')) {
        fs.mkdirSync('archives');
    }

    const zipPath =
        `archives/receipts_${year}_${month}.zip`;

    const output = fs.createWriteStream(zipPath);

    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.pipe(output);

    archive.directory(sourceDir, false);

    await archive.finalize();

    console.log('ZIP CREATED:', zipPath);

})();