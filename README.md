# Strib Lab Generators

[Yeoman](http://yeoman.io/)-based project generators for the Star Tribune newsroom visuals projects.

## Install

1. Install [NodeJS](https://nodejs.org/en/).
    * On a Mac, install Homebrew and do: `brew install node`
1. Install [Yeoman](http://yeoman.io/), and Gulp: `npm install -g yo gulp`
1. Install generator:
    1. Get this codebase: `git clone https://github.com/datanews/generator-striblab.git && generator-striblab`
    1. Install dependencies and link: `npm install && npm link`

### TODO

Needs to be public so that install generator with `npm install -g generator-striblab`

## Usage

1. Make a new directory and enter it: `mkdir new-project && cd new-project`
    * (Recommended) Create a repo on github first.
1. Run generator:
    * `yo striblab`: Front-end application.  Will ask about including the data analysis template.
    * `yo striblab:data`: Just the data analysis template.

## Development

Each directory is a template, while files in `common/` are used across templates.

### Testing

Manual testing can be done with these helpful commands.

1. Make directory and install: `mkdir generator-test && cd generator-test && yo striblab`;
1. Re-install (assumes the previous step was done and in that directory): `cd ..; rm -rv generator-test && mkdir generator-test && cd generator-test && yo striblab`

### Favicons

Favicons for front-end template generated manually with (Real Favicon Generator)[https://realfavicongenerator.net/].
