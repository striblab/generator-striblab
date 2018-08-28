/**
 * Basic wrapper to run a command line command
 */

// Dependencies
const child = require('child_process');

// Main command
function cliRunner(command, args) {
  return new Promise((resolve, reject) => {
    const proc = child.spawn(command, args);
    let stderr = '';

    // Collect stderr if there is a problem
    proc.stderr.on('data', d => {
      stderr += d.toString();
    });

    // Passes status code
    proc.on('close', status => {
      if (status) {
        console.error(stderr.slice(-5000));

        return reject(
          new Error(
            `Command "${command}" returned non-zero status of "${status}"`
          )
        );
      }

      resolve();
    });
  });
}

module.exports = cliRunner;
