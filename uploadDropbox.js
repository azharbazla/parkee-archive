const fs = require('fs');
const { Dropbox } = require('dropbox');

(async () => {

    const result = JSON.parse(
        fs.readFileSync('state/result.json', 'utf8')
    );

    if (result.status !== 'NEW_RECEIPT') {

        console.log('NO NEW FILE TO UPLOAD');
        process.exit(0);
    }

    const dbx = new Dropbox({
        accessToken: process.env.DROPBOX_TOKEN
    });

    const filePath = result.file;

    const fileName = filePath.split('/').pop();

    const fileContent = fs.readFileSync(filePath);

    // upload file
    const uploadResponse = await dbx.filesUpload({
        path: `/Parkee/${fileName}`,
        contents: fileContent,
        mode: 'overwrite'
    });

    console.log('UPLOADED:', uploadResponse.result.path_display);

    // create share link
    const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
        path: uploadResponse.result.path_display
    });

    console.log('LINK:', sharedLink.result.url);

    // save link to state
    result.dropboxLink = sharedLink.result.url;

    fs.writeFileSync(
        'state/result.json',
        JSON.stringify(result, null, 2)
    );

})();