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
const dependencies = require('./dependencies.json');
const inputs = require('./lib/input.js');
const outputs = require('./lib/output.js');
const writePackage = require('./lib/package.js');

// Update notifier
require('./lib/update.js');

// App generator
const App = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.dependencies = dependencies;
  }

  // Input prompts
  prompting() {
    this.log(outputs.welcome());

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
    // Nothing
  }

  // Write files
  writing() {
    // Package.json
    this.pkg = writePackage(this.answers, this.dependencies);
    this.fs.writeJSON(this.destinationPath('package.json'), this.pkg);

    // Templating context
    const tContext = {
      _: _,
      answers: this.answers,
      package: this.pkg,
      env: process.env
    };

    // Copy template files.  Overall, assume files are template-able
    // files.
    this.fs.copyTpl(
      this.templatePath('./**/*'),
      this.destinationPath('./'),
      tContext,
      null,
      {
        globOptions: {
          dot: true,
          // Exceptions
          ignore: _.filter(
            _.flatten([
              // Has images and binaries
              this.templatePath('./assets/**/*'),
              // We need to rename this
              this.templatePath('./.gitignore.tpl'),
              // No data analysis
              this.answers.dataAnalysis
                ? undefined
                : [
                  this.templatePath('./tests/data/**/*'),
                  this.templatePath('./data/**/*'),
                  this.templatePath('./data.workflow')
                ]
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

    // Gitignore needs to be renamed
    this.fs.copyTpl(
      this.templatePath('.gitignore.tpl'),
      this.destinationPath('./.gitignore'),
      tContext
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
    this.log(outputs.done());
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
