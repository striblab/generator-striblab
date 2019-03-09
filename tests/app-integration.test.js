/* global describe, it, beforeAll, jest */

// Dependencies
const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const cliRunner = require('./run-command.js');

// General  app
describe('strib app generator integration', () => {
  const generatorPath = path.join(__dirname, '..', 'generators', 'app');

  // Run npm for all
  beforeAll(() => {
    jest.setTimeout(50000);

    return helpers
      .run(generatorPath)
      .withPrompts({})
      .then(() => {
        return cliRunner('npm', ['install']);
      });
  });

  it('should be able to npm install', () => {
    assert.equal(true, true);
  });

  it('should be able to list gulp tasks', () => {
    return cliRunner('gulp', ['tasks']);
  });

  it('should be able to run js tests', () => {
    return cliRunner('gulp', ['js:test']);
  });

  it('should be able to run gulp build', () => {
    return cliRunner('gulp', ['build']).then(() => {
      assert.file([
        'build/index.html',
        'build/js/index.bundle.js',
        'build/styles/index.bundle.css'
      ]);
    });
  });
});
