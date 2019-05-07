/**
 * Basic wrapper to tunr a command line command through gulp
 */

// Dependencies
const gutil = require('gulp-util');
const notify = require('gulp-notify');
const child = require('child_process');

// Main command
function gulpRunner(command, args, options = {}) {
  options.notify = options.notify === undefined ? true : options.notify;

  return new Promise((resolve, reject) => {
    const commandLog = command.split('/').pop();
    const proc = child.spawn(command, args);
    const logger = buffer => {
      buffer
        .toString()
        .split(/\n/)
        .forEach(message => gutil.log(commandLog + ': ' + message));
    };

    proc.stdout.on('data', logger);
    proc.stderr.on('data', logger);

    // Passes status code
    proc.on('close', status => {
      if (status) {
        if (options.notify || options.notifyMessage) {
          notify.onError(
            () =>
              options.notifyMessage || `Error running process: ${commandLog}`
          )(new Error(`Error running: ${commandLog}`));
        }

        return reject(
          new gutil.PluginError(
            command,
            `Command returned non-zero status of ${status}; See "${commandLog}" log entries above for details.`
          )
        );
      }

      resolve();
    });
  });
}

module.exports = gulpRunner;
