/**
 * Main/default front-end app/visual generator
 */
'use strict';

// Dependencies
const path = require('path');
const _ = require('lodash');
const ejs = require('ejs');
const Generator = require('yeoman-generator');
const inputs = require('./input.js');
const dependencies = require('./dependencies.json');
const common = {
  inputs: require('../common/lib/input.js'),
  package: require('../common/lib/package.js')
};

// Common locations
common.parts = path.join(__dirname, '../', 'common', 'template-parts');
common.files = path.join(__dirname, '../', 'common', 'template-files');

// Data location
const dataTemplate = path.join(__dirname, '../', 'data', 'templates');

// App generator
const App = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.dependencies = dependencies;
  }

  // Input prompts
  prompting() {
    return this.prompt(inputs(this)).then((answers) => {
      this.answers = answers;
    });
  }

  // Determine parts (sub generators)
  default() {
    if (this.answers['data-template']) {
      this.composeWith(require.resolve('../data'), {
        answers: this.answers,
        skipInstall: true,
        composedWith: this
      });
    }
  }

  // Write files
  writing() {
    // Package.json
    if (this.answers['data-template']) {
      const d = require(path.join(dataTemplate, '../', 'dependencies.json'));
      dependencies.devDependencies = _.extend({}, d.devDependencies, d.dependencies, dependencies.devDependencies);
    }
    this.pkg = common.package(this.answers, dependencies);
    this.fs.writeJSON(this.destinationPath('package.json'), this.pkg);

    // Templating context
    const tContext = {
      _: _,
      answers: this.answers,
      package: this.pkg
    };

    // Copy common files to pass through template
    this.fs.copyTpl(
      path.join(common.files, '**/*'),
      this.destinationPath('./'),
      tContext, null, { globOptions: { dot: true }});

    // Copy files to pass through template
    this.fs.copyTpl(
      this.templatePath('./**/*'),
      this.destinationPath('./'),
      tContext,
      null,
      {
        globOptions: {
          dot: true,
          ignore: [this.templatePath('./assets/**/*')]
        }
      }
    );

    // Copy assets (since these are not text files, we don't want to pass
    // through copyTpl)
    this.fs.copy(this.templatePath('./assets/**/*'), this.destinationPath('./assets'));

    // Copy random assets that needs templating
    this.fs.copyTpl(this.templatePath('./assets/**/*.json'), this.destinationPath('./assets'), tContext);

    // Specifics that should be combined with common elements
    this.fs.write(this.destinationPath('.gitignore'),
      ejs.render([
        this.fs.read(this.templatePath('.gitignore')),
        (this.answers['data-template']) ? this.fs.read(path.join(dataTemplate, '.gitignore')) : '',
        this.fs.read(path.join(common.parts, '.gitignore'))
      ].join('\n\n'), tContext));

    this.fs.write(this.destinationPath('README.md'),
      ejs.render([
        this.fs.read(path.join(common.parts, 'README-header.md')),
        (this.answers['data-template']) ? this.fs.read(path.join(dataTemplate, 'README.md')) : '',
        this.fs.read(this.templatePath('README.md')),
        this.fs.read(path.join(common.parts, 'README-footer.md'))
      ].join('\n\n'), tContext));
  }

  // Install
  installing() {
    this.yarnInstall();
  }
};


// Export
module.exports = App;
