/**
 * Input options
 */
'use strict';

// Dependencies
const common = require('../common/lib/input.js');

// Input config
module.exports = function(generator) {
  var c = common(generator);
  c.push({
    type: 'confirm',
    name: 'data-template',
    message : 'Would you like to include the data analysis template?'
  });

  return c;
};
