## Embed

The project is designed to be a full page, linkable piece, as well as an embed.  The best way to embed the piece is with the following code:

```html
<div data-pym-src="https://example.com/<%= package.name %>">Loading...</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pym/1.1.2/pym.v1.min.js" type="text/javascript"></script>
```

## Development

### Install

The following are global prerequisites and may already be installed.

1. (on Mac) Install [homebrew](http://brew.sh/).
1. Install [Node.js](https://nodejs.org/en/).
    * (on Mac) `brew install node`
1. Install [Gulp](http://gulpjs.com/): `npm install gulp -g`

The following should be performed for initial and each code update:

1. Install Node dependencies: `npm install`

### Local

To run a local web server that will auto-reload, watch for file changes and re-build: `gulp develop`

*There's an odd issue where the very first time this command is run, it does not work completely.  Simple exit out and run it again, and all should be fine.*

### Directories and files

* `config.json`: Non-content config for application.
    * Use this to add non-local JS or CSS assets, such as from a CDN.
    * This can be overridden with a `config.custom.json` if there is a need to add configuration that should not be put into revision history.
* `content.aml`: Content-related values such as the title.  This will get processed through [ArchieML](http://archieml.org/).
    * This can be overridden with a `content.custom.aml` if there is a need to add configuration that should not be put into revision history.
* `templates/`: Holds HTML-like templates.  Any files in here will get run through [EJS](http://www.embeddedjs.com/) templating and passed values from `config.json`, `content.aml`, and `package.json`.
    * `templates/index.ejs.html`: The default page for the application.
* `styles/`: Styles in [SASS](http://sass-lang.com/) syntax.
    * `styles/index.scss`: Main point of entry for styles.
    * `styles/_*.scss`: Any includes should be prefixed with an underscore.
* `app/`: Where JS logic goes.  This supports ES2015 JS syntax with [Babel](https://babeljs.io/) and gets compiled with [Webpack](https://webpack.js.org/).
    * `app/index.js`: Main entry point of application.
* `assets/`: Various media files.  This gets copied directly to build.
* `sources/`: Directory is for all non-data source material, such as wireframes or original images.  Note that if there are materials that should not be made public, consider using Dropbox and make a note in this file about how to access.
* `tests/`: Tests for app; see Testing section below.
* The rest of the files are for building or meta-information about the project.

### Dependencies and modules

Depending on what you need to include there are a few different ways to include.

* **JS**
    * Include it with `npm`.
        * For instance: `npm install --save awesome-lib`
        * This can then be included in the application, with something like:
          ```js
          import awesome from 'awesome-lib';
          awesome.radical();
          ```
    * For dependencies that are very common and are available through a trusted CDN, you can include it in `config.json`.
        * For instance:
          ```js
          "js": {
            "globals": [
              "https://cdnjs.cloudflare.com/ajax/libs/pym/1.1.2/pym.v1.min.js"
            ]
          }
          ```
        * In your application, make sure to add a comment like the following so that linters will know that the dependency is already loaded.
          ```js
          /* global Pym */
          ```
        * **IMPORTANT** Make sure to always use a specific version from a CDN; do not use *latest* or something similar.
    * For local modules that you have written yourself, you can use the ES6 module syntax.
        * For instance, say you have created a `utils.js` module file, just use a relative path to include it:
          ```js
          import utilsFn from './utils.js';
          let utils = utilsFn({ });
          ```
* **CSS**
    * *(TODO) Find a good way to include CSS libraries locally.  Many are available on npm, so maybe just do include in SASS files?*
    * For dependencies that are very common and are available through a trusted CDN, you can include it in `config.json`.
        * For instance:
          ```js
          "css": {
            "globals": [
              "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
            ]
          }
          ```
        * **IMPORTANT** Make sure to always use a specific version from a CDN; do not use *latest* or something similar.
    *

### Testing

Testing is run via [Jest](https://facebook.github.io/jest/).  Fast, unit and higher level testing will happen on build.  You can run these test manually with `gulp js:test` or `npm test`.

*TODO*: There is a start of using headless Chrome for some functional testing in `tests/functional/basics.test.TODO.js`.  Unfortunately these take about 30 seconds to run so they are not really appropriate for on-build testing, as well as they need the Chrome (Canary) binary installed independently.

*TODO*: Some basic automated, cross-browser testing would be very beneficial.  Unfortunately things like Browserstack are very expensive, and managing our own servers to do this would be very expensive time-wise as well.

#### Embed testing

A manual test page is provided for looking at the piece embeded in another page.

1. Assumes you are running the development server with `gulp develop`
1. Run a local server for the test directory, such as `cd tests && python -m SimpleHTTPServer` or `http-server ./tests/`
1. In a browser, go to [http://localhost:8080/manual/embed.html](http://localhost:8080/manual/embed.html).

### Build

All parts are compiled into the `build/` folder.  The default complete build can be done with `gulp` or `gulp build`

### Deploy

(todo)
