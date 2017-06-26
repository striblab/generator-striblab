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

To run a local web server that will auto-reload with [Browsersync](https://browsersync.io/), watch for file changes and re-build: `gulp develop`

### Directories and files

* `config.json`: Non-content config for application.
    * Use this to add non-local JS or CSS assets, such as from a CDN.
    * This can be overridden with a `config.custom.json` if there is a need to add configuration that should not be put into revision history.
* `content.json`: See *Content and copy*.  This file is used to hold content values.  If the project is hooked up to a Google Spreadsheet, you should not manually edit this file.
* `templates/`: Holds HTML-like templates.  Any files in here will get run through [EJS](http://www.embeddedjs.com/) templating and passed values from `config.json`, `content.aml`, and `package.json`.
    * `templates/index.ejs.html`: The default page for the application.
* `styles/`: Styles in [SASS](http://sass-lang.com/) syntax.
    * `styles/index.scss`: Main point of entry for styles.
    * `styles/_*.scss`: Any includes should be prefixed with an underscore.
* `app/`: Where JS logic goes.  This supports ES2015 JS syntax with [Babel](https://babeljs.io/) and gets compiled with [Webpack](https://webpack.js.org/).
    * `app/index.js`: Main entry point of application.
* `assets/`: Various media files.  This gets copied directly to build.
* `sources/`: Directory is for all non-data source material, such as wireframes or original images.  Note that if there are materials that should not be made public, consider using Dropbox and make a note in this file about how to access.
* `lib/`: Modules used in building or other non-data tasks.
* `tests/`: Tests for app; see Testing section below.
* The rest of the files are for building or meta-information about the project.

### Content and copy

By default, content items can be managed in `content.json`.  The values put in here will be available in the templates in the `templates/` directory as the `content` object.  This can be a helpful way to separate out content from code.

#### Google Spreadsheets

If `config.json` has a `content.spreadsheetId` value specified, `content.json` can be updated with information from a Google Spreadsheet.

Since getting this content may not be very speedy, this is not done during `gulp develop`, so it requires a manual call: `gulp content`

##### Setting up

If you went through the [Striblab Generator](), then this is probably already set up for you, but in case it is not.

Getting content from a Google Spreadsheet depends on a few configurations.  You need need a Google Account (such as a Gmail account) and a Google Developer API Service Account that has read and write access to Google Sheets and Google Drive.  You should then set the following environment variables.  You can store these values in a [`.env`](https://www.npmjs.com/package/dotenv) file.

* `GOOGLE_AUTH_CLIENT_EMAIL`: This will be something like *XXXXXX@XXXXXX.iam.gserviceaccount.com*.
* `GOOGLE_AUTH_PRIVATE_KEY`: This will be something pretty long, like *--BEGIN PRIVATE--XXXXX--END PRIVATE KEY--*

*TODO* (Find some good instructions for using the Google Developer Console; unfortunately its complex and changes often.)

You can then set up a new spreadsheet with the following command, updating the email to use your Google Email.  The Google Email you use will become the owner of the document.  Note that a Google Email is not always a `@gmail.com` account.

    gulp content:create --email XXXXX@gmail.com

You can then add collaborators to the spreadsheet with the following command.  Note that you can do this in the Google Spreadsheet as well.

    gulp content:share --email XXXXX@gmail.com

##### Spreadsheet format

If you are using Google Spreadsheets for content, the headers should be `Key`, `Value`, `Type`, and `Notes`.  It is important that these are there in that exact way.  It is suggested to freeze the header row in case someone changes the order of the spreadsheet.

### Dependencies and modules

Depending on what libraries or dependencies you need to include there are a few different ways to get those into the project.

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
