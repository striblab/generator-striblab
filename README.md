# Strib Lab Generators

[Yeoman](http://yeoman.io/)-based project generators for (some of) the Star Tribune newsroom projects.

## Install

1.  Install [NodeJS](https://nodejs.org/en/).
    - On a Mac, install Homebrew and do: `brew install node`
1.  Install [Yeoman](http://yeoman.io/), and [Gulp](https://gulpjs.com/) command line tool: `npm install -g yo gulp-cli`
1.  Install generator: `npm install -g @striblab/generator-striblab`

## Usage

1.  Make a new directory and enter it: `mkdir new-project && cd new-project`
    - (Recommended) Create a repo on Github first.
1.  Run Yeoman: `yo`
    - It is suggest to use just `yo`, since it will tell you if a new version of a generator is available.
    - Note, you have to use a specific generator to get to sub-generators; see below.
1.  Answer questions and wait for install to finish up.
1.  A `README.md` will be generated describing the project and its parts.

### Specific generators

- (default) `yo "@striblab/striblab"`: Front-end application. Some of the key questions asked in this process:
  - Type of project. A _standalone embed_ is a bundled up project without external dependencies meant to be embedded in an article with an iframe. The _CMS integration_ version changes the way the application gets hosted to work with the Star Tribune CMS and focuses on creating JS, CSS, and other supporting assets.
  - Google spreadsheet integration. This is for a _standalone embed_ and sets up using a Google Spreadsheet to hold values that are used in the templates. This requires an API connection to Google and asks for the following:
    - The Google API email address which is something like `XXXXXX@XXXXXX.iam.gserviceaccount.com` and can be found in the authentication JSON you get in the Google API Console. The environment variable `GOOGLE_AUTH_CLIENT_EMAIL` will be the default.
    - The Google API private key address which is something like `--BEGIN PRIVATE--XX\\nXX\\nXX--END PRIVATE KEY--` and can be found in the authentication JSON you get in the Google API Console. The environment variable `GOOGLE_AUTH_PRIVATE_KEY` will be the default.
    - Your private Google email to assign ownership of the new spreadsheet for. The environment variable `GOOGLE_DEFAULT_SPREADSHEET_OWNER` will be the default.
  - Whether or not to include the data analysis templates, which is a folder for data analysis and an example [Drake](https://github.com/Factual/drake) workflow file.

## Development

1.  Get this codebase: `git clone https://github.com/striblab/generator-striblab.git && cd generator-striblab`
1.  Install dependencies and link: `npm install && npm link`

Each directory is a template, while files in `common/` are used across templates.

### Testing

Automated testing can be run with the following command. Note that it will take a minute, since it runs and builds the whole project.

    npm run test

Manual testing can be done with these helpful commands.

1.  Make directory and install: `mkdir -p generator-test && cd generator-test && yo "@striblab/striblab"`;
1.  Re-install (assumes the previous step was done and you are in that directory): `cd ..; rm -rv generator-test && mkdir -p generator-test && cd generator-test && yo "@striblab/striblab"`
    - Debug: `cd ..; rm -rv generator-test && mkdir generator-test && cd generator-test && DEBUG=yeoman:* yo "@striblab/striblab"`

## Publishing

Publish to [npm](https://www.npmjs.com/package/@striblab/generator-striblab).

1.  Run tests, and do manual testing as the automated tests are very basic.
1.  Update version, `X.X.X`, in `package.json` and then run `npm install`
1.  Commit changes, i.e. `git commit -m "Updated version."`
1.  Tag with the same version number: `git tag X.X.X`
1.  Push up to Github: `git push origin --tags`
1.  Publish to npm: `npm publish --access public`

## Credits

### Favicons

Favicons for front-end template generated manually with [Real Favicon Generator](https://realfavicongenerator.net/).
