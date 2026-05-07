const fs = require('fs');
const { google } = require('googleapis');

(async () => {

    const result = JSON.parse(
        fs.readFileSync('state/result.json', 'utf8')
    );

    if (result.status !== 'NEW_RECEIPT') {

        console.log('NO NEW FILE TO UPLOAD');
        process.exit(0);
    }

    const credentials = JSON.parse(
        process.env.GDRIVE_CREDENTIALS
    );

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({
        version: 'v3',
        auth
    });

    const fileMetadata = {
        name: result.file.split('/').pop(),
        parents: [process.env.GDRIVE_FOLDER_ID]
    };

    const media = {
        mimeType: 'image/png',
        body: fs.createReadStream(result.file)
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id, webViewLink'
    });

    console.log('UPLOADED:', response.data);

    result.driveLink = response.data.webViewLink;

    fs.writeFileSync(
        'state/result.json',
        JSON.stringify(result, null, 2)
    );

})();