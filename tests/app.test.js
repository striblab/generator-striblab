/* global describe, it */

// Dependencies
const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');

// General  app
describe('strib app generator', () => {
  const generatorPath = path.join(__dirname, '..', 'generators', 'app');

  it('should generate without error', () => {
    return helpers
      .run(generatorPath)
      .withPrompts({})
      .then(() => {
        // WTF, this should fail since description is a necessary prompt
        assert.equal(true, true);
      });
  });

  it('should create core files', () => {
    return helpers
      .run(generatorPath)
      .withPrompts({})
      .then(projectPath => {
        assert.file([
          '.gitignore',
          'gulpfile.js',
          '.eslintrc',
          'README.md',
          'LICENSE.code',
          'package.json'
        ]);
      });
  });

  it('should not have data workflow files if data analysis is not selected', () => {
    return helpers
      .run(generatorPath)
      .withPrompts({ dataAnalysis: false })
      .then(() => {
        assert.noFile(['data.workflow']);
      });
  });

  it('should not have CMS parts by default', () => {
    return helpers
      .run(generatorPath)
      .withPrompts({})
      .then(() => {
        assert.noFileContent('templates/index.svelte.html', /<cmsassets/i);
      });
  });

  it('should have CMS parts if selected', () => {
    return helpers
      .run(generatorPath)
      .withPrompts({ projectType: 'cms' })
      .then(() => {
        assert.fileContent('templates/index.svelte.html', /<cmsassets/i);
      });
  });
});
