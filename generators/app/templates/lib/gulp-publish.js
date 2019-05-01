/**
 * Content tasks
 */

// Dependencies
const gulp = require('gulp');
const zlib = require('zlib');
const _ = require('lodash');
const crypto = require('crypto');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const moment = require('moment');
const awspublish = require('gulp-awspublish');
const AWS = require('aws-sdk');
const openurl = require('openurl');
const { argv } = require('yargs');
const configUtil = require('./config.js');
require('dotenv').load({ silent: true });

// Constant flags used in publishing
const commonFlags = {
  '--default':
    'This is what is used if no similar flag is present.  Uses publish.default section in config.json.',
  '--production': 'Uses publish.production section in config.json.',
  '--staging': 'Uses publish.staging section in config.json.',
  '--testing': 'Uses publish.testing section in config.json.',
  '--force': 'Force the token check to go through.',
  '--publish-version':
    'Publish a specific version; can specify a string, like --publish-version=my-version or will default to today\'s date.'
};

// Main publish function
async function publish() {
  await checkAWS();
  let v = versionPath();
  let p = getPublishConfig();
  let publisher = awspublish.create({
    params: {
      Bucket: p.bucket
    }
  });
  // Cache.  Note that aws-publish uses public-read by default
  let headers = {
    CacheControl: `public, max-age=${p.cacheSeconds || 60}, must-revalidate`,
    Expires: moment()
      .add(p.cacheSeconds || 60, 'seconds')
      .toDate()
  };

  // Compare tokens
  try {
    await compareToken();
  }
  catch (e) {
    throw new gutil.PluginError('publish', e);
  }

  gutil.log(`Using bucket ${gutil.colors.yellow(p.bucket)}`);
  return gulp
    .src('build/**/*')
    .pipe(
      rename(path => {
        path.dirname = `${trailingSlash(p.versionPath)}/${path.dirname}`;
      })
    )
    .pipe(awspublish.gzip())
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
}
publish.description =
  'Copies build folder up to S3 using the configuration found in config.json.';
publish.flags = commonFlags;

// Write token to build
async function buildToken() {
  let { config, error } = configUtil.getConfig();
  if (error) {
    throw new gutil.PluginError('publish', error);
  }
  checkToken();

  // Quick way to create a vinyl source
  const stringInput = (filename, string) => {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function() {
      this.push(
        new gutil.File({
          cwd: '',
          base: '',
          path: filename,
          contents: Buffer.from(string)
        })
      );
      this.push(null);
    };
    return src;
  };

  return stringInput('publish-token', config.publishToken).pipe(
    gulp.dest('./build')
  );
}
buildToken.description = 'Write publish-token file to build for publishing.';

// Check publish token
async function compareToken() {
  await checkAWS();
  let s3 = new AWS.S3();
  let p = getPublishConfig();
  let { config, error } = configUtil.getConfig();
  if (error) {
    throw new gutil.PluginError('publish', error);
  }
  let key = `${trailingSlash(p.versionPath)}/publish-token`;
  checkToken();

  // If force
  if (argv.force) {
    gutil.log(gutil.colors.yellow('Forcing confirmation.'));
    return;
  }

  // Get remote file
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: p.bucket,
        Key: key
      },
      (error, data) => {
        // If there is no file there to check, then that is ok.
        if (error && error.code === 'NoSuchKey') {
          gutil.log(
            gutil.colors.yellow(
              `Unable to find "${key}" on bucket "${
                p.bucket
              }".  This could mean that the project has not been published yet, or that there is no publish token there.`
            )
          );
          return resolve();
        }
        else if (error) {
          gutil.log(
            gutil.colors.red('Error getting publish token file on S3.')
          );
          return reject(
            new gutil.PluginError('publish', error, { showStack: true })
          );
        }

        // Read token
        let token;
        try {
          token = zlib.gunzipSync(data.Body).toString('utf-8');
        }
        catch (e) {
          gutil.log(gutil.colors.red('Error parsing token file on S3.'));
          return reject(
            new gutil.PluginError('publish', e, { showStack: true })
          );
        }

        if (token && token === config.publishToken) {
          gutil.log(`${gutil.colors.green('✓')} Tokens match.`);
          return resolve(token);
        }
        else {
          return reject(
            new gutil.PluginError(
              'publish',
              `Tokens do not match, please make sure that this project should be deployed to "${key}" on bucket "${
                p.bucket
              }".  Or, use the --force flag to force the publish.`
            )
          );
        }
      }
    );
  });
}
compareToken.description =
  'Compare the token defined as publishToken in config.json with the remote one on S3.';
compareToken.flags = commonFlags;

// General info about publishing
async function info() {
  // Check AWS
  try {
    await checkAWS(true);
  }
  catch (e) {
    // This should already output any issues
  }

  // Check token
  try {
    checkToken();
    gutil.log(`\n${gutil.colors.green('✓')} Token check passed.`);
  }
  catch (e) {
    gutil.log(
      `\n${gutil.colors.red('x')} Unable to find token in config file.`
    );
  }

  // Get config
  let { config, error } = configUtil.getConfig();
  if (error) {
    throw new gutil.PluginError('publish', error);
  }

  // Get what publish config
  let p = getPublishConfig();
  let configOutput = '\nPublish configs available:\n\n';
  _.each(config.publish, (publish, pi) => {
    configOutput += `${gutil.colors.magenta(pi)} ${
      pi === p.id ? gutil.colors.green('active') : ''
    }
  ${gutil.colors.gray('S3 bucket:')} ${publish.bucket}
  ${gutil.colors.gray('Path in bucket:')} ${publish.bucket}
  ${gutil.colors.gray('Cache length in seconds:')} ${publish.cacheSeconds}
  ${gutil.colors.gray('URL to project on S3:')} ${publish.url}
  ${gutil.colors.gray('URL to project on S3 (versioned):')} ${
  publish.versionUrl
}
  ${gutil.colors.gray('S3 URL:')} s3://${publish.bucket}/${publish.bucket}\n\n`;
  });
  gutil.log(configOutput);

  // Output some info about config
}
info.description =
  'Do some checks for publishing and output helpful information and configuration.';
info.flags = commonFlags;

// Check config for token
function checkToken() {
  let { config, error } = configUtil.getConfig();
  if (error) {
    throw new gutil.PluginError('publish', error);
  }

  if (!config.publishToken) {
    throw new gutil.PluginError(
      'publish',
      `Unable to find the publishToken value in config.json.  This should be a random, unique string.  It helps to ensure that things are not overwritten accidentally.  Why not just try this one: ${gutil.colors.green(
        randomToken()
      )}`
    );
  }

  return true;
}
checkToken.description = 'Check to see if a publish token exists.';

// Check aws access
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
async function checkAWS(logInfo = false) {
  let configCredentials = new AWS.SharedIniFileCredentials();
  let envCredentials = new AWS.EnvironmentCredentials('AWS');
  let errors = [];

  // General info
  if (logInfo) {
    gutil.log(`
There are a few ways to get AWS credentials to be able to publish to S3.

    * Using the 'default' credentials as defined in your ~/.aws/credentials file.
    * A different crenditals profile can be used with the environment variable:
      AWS_PROFILE
    * Or you can set your ID and Key explicitly with the environment variables:
      AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

Any environment variables can be stored in a '.env' file in the project directory.

For more details see:
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
    `);
  }

  // Try id and key
  try {
    envCredentials.refresh();
    if (!envCredentials.accessKeyId) {
      throw new Error(
        'Was able to load credentials via the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables, but something went wrong and the Access Key was not loaded succesfully.'
      );
    }
    if (logInfo) {
      gutil.log(
        `\n${gutil.colors.green(
          '✓'
        )} Can load credentials via the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.\n`
      );
    }
  }
  catch (e) {
    errors.credentialsError = true;
    errors.push(e);

    if (logInfo) {
      gutil.log(
        `\n${gutil.colors.red(
          'x'
        )} Unable to load credentials via the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.\n`
      );
    }
  }

  // Check config files
  try {
    await configCredentials.getPromise();
    if (!configCredentials.accessKeyId) {
      throw new Error(
        'Was able to load credentials via ~/.aws config and maybe AWS_PROFILE environment variables, but something went wrong and the Access Key was not loaded succesfully.'
      );
    }
    if (logInfo) {
      gutil.log(
        `\n${gutil.colors.green(
          '✓'
        )} Can load credentials via ~/.aws config (and optionally AWS_PROFILE environment variables).  Using profile: ${gutil.colors.magenta(
          configCredentials.profile
        )}\n`
      );
    }
  }
  catch (e) {
    errors.configError = true;
    errors.push(e);

    if (logInfo) {
      gutil.log(
        `\n${gutil.colors.red(
          'x'
        )} Unable load credentials via ~/.aws config (and optionally AWS_PROFILE environment variables).\n`
      );
    }
  }

  if (errors && errors.configError && errors.credentialsError) {
    errors.forEach(e => {
      gutil.log(gutil.colors.red(e));
    });
    throw new gutil.PluginError(
      'publish',
      'Unable to load AWS credentials with environment variables and/or config files.'
    );
  }
}

// Determine which publish config we want
function getPublishConfig() {
  let v = versionPath();
  let { config, error } = configUtil.getConfig();
  if (error) {
    throw new gutil.PluginError('publish', error);
  }

  if (!config.publish) {
    throw new gutil.PluginError(
      'publish',
      'Unable to find a publish object in the config.json.'
    );
  }

  // Allow for production, staging, testing, and default
  let found =
    argv.production && config.publish.production
      ? _.extend(config.publish.production, { id: 'production' })
      : argv.staging && config.publish.staging
        ? _.extend(config.publish.staging, { id: 'staging' })
        : argv.testing && config.publish.testing
          ? _.extend(config.publish.testing, { id: 'testing' })
          : _.extend(config.publish.default, { id: 'default' });

  // Add versions
  if (found && found.url) {
    found.versionUrl = v ? `${trailingSlash(found.url)}/${v}` : found.url;
  }
  if (found && found.path) {
    found.versionPath = v ? `${trailingSlash(found.path)}/${v}` : found.path;
  }

  return found;
}

// Open URL
async function open() {
  let p = getPublishConfig();
  if (!p.versionUrl) {
    throw new gutil.PluginError(
      'publish',
      `Unable to find the url parameter in the ${p.id} publish config.`
    );
  }
  openurl.open(p.versionUrl);
}
open.description =
  'Open URL for the published project.  This is defined as the "url" parameter in the publish config in config.json.';
open.flags = commonFlags;

// Get version path from argv
function versionPath() {
  let prefix = '_versions';

  if (argv && argv.publishVersion === true) {
    return `${prefix}/${new Date().toISOString().split('T')[0]}`;
  }
  else if (argv && argv.publishVersion) {
    return `${prefix}/${_.kebabCase(argv.publishVersion)}`;
  }

  return '';
}

// Random token
function randomToken() {
  return crypto.randomBytes(16).toString('hex');
}

// Remove trailing slach
function trailingSlash(input) {
  return _.isString(input) ? input.replace(/\/$/, '') : input;
}

// Exports
module.exports = {
  publish,
  buildToken,
  compareToken,
  info,
  open
};
