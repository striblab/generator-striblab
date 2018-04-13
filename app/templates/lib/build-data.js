/**
 * Put together multiple local and remote sources
 * for building templates
 */

const io = require('indian-ocean');
const r = require('request');
const request = require('cached-request')(r);
const path = require('path');
const _ = require('lodash');
const csv = require('d3-dsv').dsvFormat(',');

// Configure
request.setCacheDirectory(path.join(__dirname, '..', '.cache-remote-data'));

// Get remote source
async function remoteSource(url, options = {}) {
  options.url = url;
  options.ttl = options.ttl || 60 * 10;

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      // Handle JSON or CSV
      if (url.match(/json/)) {
        return resolve(JSON.parse(body));
      }
      else if (url.match(/csv/)) {
        return resolve(csv.parse(body));
      }

      resolve(body);
    });
  });
}

// Main export.  Pass in an array of paths or objects with a location
// key for the path.specific
module.exports = async (sources, cwd = path.join(__dirname, '..')) => {
  let converted = {};

  for (let si in sources) {
    // Check if source is object or string
    let options = sources[si];
    if (!_.isObject(options)) {
      options = {
        location: options
      };
    }

    // Look for specific options
    if (options.renameHeaders) {
      options.map = row => {
        return _.mapKeys(row, (v, k) => _.camelCase(k));
      };
    }

    // Pass through
    if (options.data) {
      converted[si] = options.data;
      continue;
    }

    // Handle different locations
    if (options.location.match(/^http/i)) {
      converted[si] = await remoteSource(options.location, options);
    }
    else if (options.location.match(/^\//i)) {
      converted[si] = io.readDataSync(options.location, options);
    }
    else {
      converted[si] = io.readDataSync(
        path.join(cwd, options.location),
        options
      );
    }
  }

  return converted;
};
