/**
 * Main/default front-end app/visual generator
 */
'use strict';

// Dependencies
const path = require('path');
const _ = require('lodash');
const ejs = require('ejs');
const chalk = require('chalk');
const Generator = require('yeoman-generator');
const inputs = require('./input.js');
const dependencies = require('./dependencies.json');
const common = {
  inputs: require('../../shared/lib/input.js'),
  output: require('../../shared/lib/output.js'),
  package: require('../../shared/lib/package.js')
};
require('../../shared/lib/update.js');

// Common locations
common.parts = path.join(__dirname, '..', '..', 'shared', 'template-parts');
common.files = path.join(__dirname, '..', '..', 'shared', 'template-files');

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
    this.log(common.output.welcome());

    return this.prompt(inputs(this)).then(answers => {
      // Format some ansers
      answers.cmsIDs = answers.cmsIDs
        ? _.map(answers.cmsIDs.split(','), d => d.trim())
        : answers.cmsIDs;
      answers.lcdIDs = answers.lcdIDs
        ? _.map(answers.lcdIDs.split(','), d => d.trim())
        : answers.lcdIDs;

      this.answers = answers;
    });
  }

  // Determine parts (sub generators)
  default() {
    if (this.answers.dataTemplate) {
      this.composeWithDataOptions = {
        answers: this.answers,
        skipInstall: true,
        composedWith: this,
        composedFrom: this.composeWithData
      };
      this.composeWith(require.resolve('../data'), this.composeWithDataOptions);
    }
  }

  // Write files
  writing() {
    // Package.json
    if (this.answers.dataTemplate) {
      const d = require(path.join(dataTemplate, '../', 'dependencies.json'));
      dependencies.devDependencies = _.extend(
        {},
        d.devDependencies,
        d.dependencies,
        dependencies.devDependencies
      );
    }
    this.pkg = common.package(this.answers, dependencies);
    this.fs.writeJSON(this.destinationPath('package.json'), this.pkg);

    // Templating context
    const tContext = {
      _: _,
      answers: this.answers,
      package: this.pkg,
      env: process.env
    };

    // Copy common files to pass through template
    this.fs.copyTpl(
      path.join(common.files, '**/*'),
      this.destinationPath('./'),
      tContext,
      null,
      {
        globOptions: {
          dot: true
        }
      }
    );

    // Copy app template files to pass through template
    this.fs.copyTpl(
      this.templatePath('./**/*'),
      this.destinationPath('./'),
      tContext,
      null,
      {
        globOptions: {
          dot: true,
          // Ignore assets (and data if needed)
          ignore: _.filter(
            _.flatten([
              this.templatePath('./assets/**/*'),
              this.templatePath('./.gitignore.tpl'),
              this.answers.dataTemplate
                ? undefined
                : this.templatePath('./tests/data/**/*'),
              this.answers.projectType === 'cms'
                ? // For the CMS version, we dont' use a full page structure
                [
                  this.templatePath('./pages/_footer*.html'),
                  this.templatePath('./pages/_header*.html')
                ]
                : this.templatePath('./cms/**/*')
            ])
          )
        }
      }
    );

    // Copy assets (since these are not text files, we don't want to pass
    // through copyTpl)
    this.fs.copy(
      this.templatePath('./assets/**/*'),
      this.destinationPath('./assets')
    );

    // Copy random assets that needs templating
    this.fs.copyTpl(
      this.templatePath('./assets/**/*.json'),
      this.destinationPath('./assets'),
      tContext
    );

    // Specifics that should be combined with common elements
    this.fs.write(
      this.destinationPath('.gitignore'),
      ejs.render(
        [
          this.fs.read(this.templatePath('.gitignore.tpl')),
          this.answers.dataTemplate
            ? this.fs.read(path.join(dataTemplate, '.gitignore.tpl'))
            : '',
          this.fs.read(path.join(common.parts, '.gitignore.tpl'))
        ].join('\n\n'),
        tContext
      )
    );

    // TODO: sub generators are one-way and can get data from parent, but not
    // send data.  This means we can't know about data answers
    this.answers.useDrake =
      this.answers.useDrake === undefined ? true : this.answers.useDrake;
    this.fs.write(
      this.destinationPath('README.md'),
      ejs.render(
        [
          this.fs.read(path.join(common.parts, 'README-header.md')),
          this.answers.dataTemplate
            ? this.fs.read(path.join(dataTemplate, 'README.md'))
            : '',
          this.fs.read(this.templatePath('README.md')),
          this.fs.read(path.join(common.parts, 'README-footer.md'))
        ].join('\n\n'),
        tContext
      )
    );
  }

  // Install
  install() {
    this.log(chalk.cyan('\nInstalling npm packages...\n'));
    this.npmInstall(undefined, { silent: true, loglevel: 'error' }).then(() => {
      // Do Google Spreadsheet steps here
      if (this.answers.googleSpreadsheet) {
        this._createSpreadsheet();
      }
    });
  }

  // All done
  end() {
    this.log(common.output.done());
    this.log(
      chalk.cyan('Run ') +
        chalk.bgYellow.black(' gulp develop ') +
        chalk.cyan(' to start developing.')
    );
    this.log();
    this.log(
      chalk.cyan('Run ') +
        chalk.bgYellow.black(' gulp help ') +
        chalk.cyan(' to see the other available commands.')
    );
    this.log();
  }

  // Create google spreadsheet step
  _createSpreadsheet() {
    this.log();
    this.log(chalk.cyan('Setting up the Google Spreadsheet.'));
    this.log();

    // TODO: Find a way to make these commands not show output.
    let create = this.spawnCommandSync('gulp', [
      'content:create',
      '--quiet',
      '--email',
      this.answers.googleSpreadsheetOwner
    ]);
    if (create && create.error) {
      this.log(chalk.red('Error creating spreadsheet.'));
      throw create.error;
    }

    let owner = this.spawnCommandSync('gulp', [
      'content:owner',
      '--email',
      this.answers.googleSpreadsheetOwner
    ]);
    if (owner && owner.error) {
      this.log(
        chalk.red(
          'Error changing owner to: ' + this.answers.googleSpreadsheetOwner
        )
      );
      throw owner.error;
    }

    this.log();
    this.log(
      chalk.cyan(
        'Spreadsheet setup successfully. We changed the owner to this \nemail address:\n\n'
      ) +
        '  ' +
        chalk.green(this.answers.googleSpreadsheetOwner) +
        '\n\n' +
        chalk.cyan(
          'If you want to share this speadsheet with other \nGoogle accounts, you can run something like:\n\n'
        ) +
        '  ' +
        chalk.bgYellow.black('gulp content:share --email XXXXXX@XXXXX.COM') +
        '\n\n' +
        chalk.cyan('To open the spreadsheet in your browser, use:\n\n') +
        '  ' +
        chalk.bgYellow.black('gulp content:open')
    );
    this.log();
    this.log();
  }
};

// Export
module.exports = App;
