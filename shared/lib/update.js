/**
 * Notify users if they need to update.
 */

const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');

updateNotifier({
  pkg
}).notify({
  isGlobal: true
});
