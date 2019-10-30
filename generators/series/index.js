// require statement with packages and other js files
const Generator = require('yeoman-generator');
const crypto = require('crypto');
const chalk = require('chalk');
const _ = require('lodash');
const inputs = require('./lib/input.js');
const path = require('path');
const outputs = require('./lib/output.js');

const App = class extends Generator {
  constructor(args, opts) {
    super(args, opts)
  }

  prompting() {
    this.log(outputs.welcome());

    return this.prompt(inputs(this)).then(answers => {
      this.answers = answers;
    });
  }

  writing() {
    const tContext = {
      _: _,
      answers: this.answers,
      token: randomToken()
    };

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
              // We need to rename this
              this.templatePath('./.gitignore.tpl'),
            ])
          )
        }
      }
    );

    this.fs.copyTpl(
      this.templatePath('.gitignore.tpl'),
      this.destinationPath('./.gitignore'),
      tContext
    );
  }

  install() {
    this.log(chalk.cyan('\nInstalling npm packages...\n'));
    this.npmInstall(undefined, { silent: true, loglevel: 'error' }).then(() => {
      // Do post install stuff here
    });
  }

  end() {
    this.log(outputs.done());
  }

};

function randomToken() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = App;
