// dependencies
const _ = require('lodash');

module.exports = function(generator) {
  let c = [];

  c.push({
    type: 'input',
    name: 'name',
    message: 'Please enter a project name. Be sure that there are no spaces in the name i.e. "testapp"',
    filter: _.kebabCase,
    required: true,
    validate: function(str) {
      return str.length > 0;
    },
    default: _.kebabCase(generator.appname)
  });

  c.push({
    type: 'input',
    name: 'description',
    message: 'Description',
    required: true,
    validate: function(str) {
      return str.length > 0;
    }
  });

  c.push({
    type: 'list',
    name: 'projectType',
    message: 'Is this project responsive or will it have separate codebases?',
    default: 'responsive',
    choices: [
      {
        name: 'Responsive -- one codebase for both mobile and desktop',
        value: 'responsive',
        short: 'Responsive design'
      },
      {
        name: 'Mobile/Desktop -- two separate codebases for each platform',
        value: 'separate',
        short: 'Mobile/desktop design'
      }
    ]
  });

  c.push({
    type: 'input',
    name: 'cmsIDs',
    message: 'The Clickability CMS article ID(s).  For multiple ID\'s, separate by\n   a comma, such as "123, 456".'
  });

  c.push({
    type: 'input',
    name: 'lcdIDs',
    message: 'The Clickability CMS Linked-Content-Data (LCD) ID(s).  For multiple ID\'s, separate by\n   a comma, such as "123, 456".'
  });

  c = c.map(i => {
    i.message = i.message + '\n';
    return i;
  });

  return c;
};
