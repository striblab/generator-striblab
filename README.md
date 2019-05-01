# Strib Lab Generators

[Yeoman](http://yeoman.io/)-based project generators for (some of) the Star Tribune newsroom projects.

## Install

1.  Install [NodeJS](https://nodejs.org/en/).
    - On a Mac, install Homebrew and do: `brew install node`
    - Make sure you are using the latest version of Node 8 or later.
1.  Install [Yeoman](http://yeoman.io/), and [Gulp](https://gulpjs.com/) command line tools: `npm install -g yo gulp-cli`
1.  Install generator: `npm install -g @striblab/generator-striblab`

## Usage

1.  Make a new directory and enter it: `mkdir new-project && cd new-project`
    - (Recommended, but not necessary) Create a repo on Github first and check that out.
1.  Run Yeoman: `yo`
    - It is suggested to use just `yo`, since it will tell you if a new version of a generator is available.
1.  Answer questions and wait for install to finish up.
1.  A `README.md` will be generated describing the project and its parts.

### Questions

When answering the questions, you may see something like the following right after the question: `(my-project)`. This is the default value for the question and if you just hit Enter, then this value will be used.

- **Name**: The identifier for the project. This should be similar to the folder name that project is in, ideally all lowercase and using hyphens, no spaces. This gets used when publishing up to S3.
- **Title**: The title of the project. This is used as default metadata fora project which is important for standalone projects.
- **Description**: Description of the project. Same use as _Title_.
- **Author name**: This is pulled from your Git config by default. This is put into the `package.json` and put into default metadata.
- **Author email**: This is pulled from your Git config by default. This is put into the `package.json`.
- **Type of project**:
  - A _standalone embed_ is a bundled up project without external dependencies meant to be embedded in an article with an iframe.
  - The _CMS integration_ version changes the way the application gets hosted to work with the Star Tribune CMS and focuses on creating JS, CSS, and other supporting assets.
- For CMS integration projects:

  - **Strib Styles selector**: The custom selector to use with [Strib Styles](https://striblab.github.io/strib-styles/). This ensures that any Strib Styles or project styles won't affect the site styles.
  - **CMS IDs**: List of CMS article IDs that the project will publish to. This can be left blank and filled in later.
  - **CMS LCD IDs**: List of CMS article IDs that the project will publish to. This can be left blank and filled in later.

- **Data analysis templates**: Whether or not to include the data analysis templates, which is a folder for data analysis and an example [Drake](https://github.com/Factual/drake) workflow file.

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
