/**
 * Google drive related tasks, such as sharing
 */

// Dependencies
const fs = require('fs');
const gutil = require('gulp-util');
const { copy } = require('copy-paste');
const argv = require('yargs').argv;
const pkg = require('../package.json');
const GoogleDrive = require('./google-drive.js');
const GoogleDocs = require('./google-docs.js');
const GoogleSheets = require('./google-sheets.js');

// Share a file with an email address
async function share() {
  let g = new GoogleDrive();
  await g.share(argv.id, argv.email, argv.role || 'writer');
  let url = `https://drive.google.com/open?id=${argv.id}`;
  await asyncCopy(url);

  gutil.log(`
File shared with "${argv.email}" with "${argv.role || 'writer'} permission.
URL (copied to clipboard):
    ${gutil.colors.cyan(url)}
`);
}

// Share a file and make owner with an email address
async function owner() {
  let g = new GoogleDrive();
  await g.share(argv.id, argv.email, 'owner', true);
  let url = `https://drive.google.com/open?id=${argv.id}`;
  await asyncCopy(url);

  gutil.log(`
Owner transfered to "${argv.email}".  URL (copied to clipboard):
    ${gutil.colors.cyan(url)}
`);
}

// Output for new file is the same
async function newFileOutput(response, g) {
  let link = response.data.webViewLink || response.data.spreadsheetUrl;
  let id = response.data.id || response.data.spreadsheetId;
  await asyncCopy(link);

  gutil.log(`
New document created.  URL (copied to clipboard):
  ${gutil.colors.cyan(link)}
`);

  // Change ownership
  if (argv.email) {
    await g.share(id, argv.email, 'owner', true);
    gutil.log(`
Owner changed to:
  ${gutil.colors.cyan(argv.email)}
`);
  }
  else {
    gutil.log(`
By default, only the API user can access the new file.
It is suggested to use the following to make yourself
the owner:
  ${gutil.colors.cyan(
    `gulp google:owner --id="${id}" --email="your-google@gmail.com"`
  )}
`);
  }
}

// New document
async function newDoc() {
  let g = new GoogleDocs();
  let title = argv.title || `New document for ${pkg.name} project`;
  let response = await g.newDoc({ title });
  await newFileOutput(response, g);
}

// Create new sheet
async function newSheet() {
  let g = new GoogleSheets();
  let title = argv.title || `New document for ${pkg.name} project`;
  let sheetTitle = argv.sheetTitle || 'Content for project';
  let response = await g.newBlankSheet({ title, sheetTitle });
  await newFileOutput(response, g);
}

// Create new content sheet
async function newContentSheet() {
  let g = new GoogleSheets();
  let title = argv.title || `New document for ${pkg.name} project`;
  let sheetTitle = argv.sheetTitle || 'Content for project';
  let response = await g.newSheet({ title, sheetTitle });
  await newFileOutput(response, g);
}

// Determine email address of API user
async function apiInfo() {
  let config = getAPIConfig();
  await asyncCopy(config.client_email);

  gutil.log(`
The credentials file that was read:
  ${gutil.colors.cyan(process.env.GOOGLE_APPLICATION_CREDENTIALS)}
`);

  gutil.log(`
API client email that is needed fot API access (copied to clipboard):
  ${gutil.colors.cyan(config.client_email)}
`);
}

// Determine if API is setup correctly
function getAPIConfig() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new gutil.PluginError(
      'google',
      'Unable to find the GOOGLE_APPLICATION_CREDENTIALS environment variable which is a path to some Google API credentials file.  You can set this in a ".env" file in the project.  It might looks something like "/Users/your-name/.google-strib-credentials-XXXX.json".'
    );
  }

  if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    throw new gutil.PluginError(
      'google',
      `The GOOGLE_APPLICATION_CREDENTIALS file, "${
        process.env.GOOGLE_APPLICATION_CREDENTIALS
      }", does not exist.`
    );
  }

  let config;
  try {
    config = JSON.parse(
      fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8')
    );
  }
  catch (e) {
    throw new gutil.PluginError(
      'google',
      `Unable to parse the GOOGLE_APPLICATION_CREDENTIALS file, "${
        process.env.GOOGLE_APPLICATION_CREDENTIALS
      }": ${e.message}`
    );
  }

  return config;
}

// Async copy
async function asyncCopy(v) {
  return new Promise((resolve, reject) => {
    try {
      copy(v, o => {
        resolve(o);
      });
    }
    catch (e) {
      reject(e);
    }
  });
}

// Exports
module.exports = {
  share,
  owner,
  newDoc,
  newSheet,
  newContentSheet,
  apiInfo,
  getAPIConfig
};
