/**
 * Air Supply config file
 * https://www.npmjs.com/package/air-supply
 *
 * Air Supply gathers data from sources that are used in
 * the build process.
 */

// Depdencies
const gutil = require('gulp-util');
const { argv } = require('yargs');

// Export
module.exports = {
  // Default cache
  ttl: 1000 * 60 * 60 * 24,
  // Cache path
  cachePath: '.cache-air-supply',
  // Allow --no-cache to turn off caching
  noCache: argv.cache === false,
  // Datasets
  packages: {
    // Pull in config
    config: 'config.json',
    // Pull in content data
    content: 'content.json',
    argv: {
      source: argv,
      type: 'data'
    }

    // Example external data source
    // external: {
    //   source: 'http://example.com/sample.json',
    //   // parsers use the source to determine how to parse
    //   // unless explicitly set
    //   parsers: 'json',
    //   transform: (data) => {
    //     return processProcess(data);
    //   }
    // }

    // Example Google sheet (with headers)
    // Need to have GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CONSUMER_SECRET set (in the .env file)
    // googleSheet: {
    //   source: '1by2j2MNyhKlAgULgysi413jptqitxWvCYZYgl-M1Ezo',
    //   type: 'google-sheet'
    // },

    // Or just use the CSV publish-to-web
    // googleSheetCSV: {
    //   source: 'https://google.com/doc/xxxxx/csv',
    //   parsers: 'csv'
    // },
  }
};
