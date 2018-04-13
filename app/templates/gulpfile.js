/**
 * Task running and building through Gulp.
 * http://gulpjs.com/
 *
 * Overall, use config files (like .babelrc) to manage
 * options for processes.  This will allow moving away from
 * Gulp more easily if desired.
 */
'use strict';

// Dependencies
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const gulp = require('gulp');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const noopener = require('gulp-noopener');
const eslint = require('gulp-eslint');
const stylelint = require('gulp-stylelint');
const sass = require('gulp-sass');
const htmlhint = require('gulp-htmlhint');
const autoprefixer = require('gulp-autoprefixer');
const include = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const a11y = require('gulp-a11y');
const taskListing = require('gulp-task-listing');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const del = require('del');
const gulpContent = require('./lib/gulp-content.js');
const gulpPublish = require('./lib/gulp-publish.js');
const jest = require('./lib/gulp-jest.js');
const buildData = require('./lib/build-data.js');
const config = exists('config.custom.json') ? require('./config.custom.json') : require('./config.json');
const argv = require('yargs').argv;
require('dotenv').load({ silent: true });

// Process base html templates/pages (not templates used in front-end JS),
// Add more data local or remotely like:
//   events: 'http://example.com/events.json',
//   things: 'source/things.csv'
gulp.task('html', async () => {
  let data = await buildData({
    content: 'content.json',
    pkg: 'package.json',
    config: { data: config },
    argv: { data: argv },
    _: { data: _ }
  });

  return gulp
    .src(
      _.filter(
        _.flatten([
          'pages/**/!(_)*.ejs.html',
          // Get list of templates we might want rendered besides pages.
          // See rewriting in server section.
          config.cms && config.cms.rewriteMapping
            ? _.map(
              _.values(config.cms.rewriteMapping),
              v => `pages/${v.replace(/\.html/, '.ejs.html')}`
            )
            : undefined
        ])
      )
    )
    .pipe(include({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(ejs(data).on('error', gutil.log))
    .pipe(rename(function(path) {
      path.basename = path.basename.replace('.ejs', '');
    }))
    .pipe(noopener.warn())
    .pipe(gulp.dest('build/'));
});

// Lint HTML (happens after HTML build process).  The "stylish" version
// is more succinct but its less helpful to find issues.
gulp.task('html:lint', ['html'], () => {
  return gulp.src('build/*.html')
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter('htmlhint-stylish'))
    .pipe(a11y())
    .pipe(a11y.reporter());
});
gulp.task('html:lint:details', ['html'], () => {
  return gulp.src('build/*.html')
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter())
    .pipe(a11y())
    .pipe(a11y.reporter());
});

// Content tasks
gulp.task('content', gulpContent.getContent(gulp, config));
gulp.task('content:create', gulpContent.createSheet(gulp, config));
gulp.task('content:open', gulpContent.openContent(gulp, config));
gulp.task('content:owner', gulpContent.share(gulp, config, 'owner'));
gulp.task('content:share', gulpContent.share(gulp, config, 'writer'));

// Lint JS
gulp.task('js:lint', () => {
  return gulp.src(['app/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

// Lint styles/css
gulp.task('styles:lint', () => {
  return gulp.src(['styles/**/*.scss'])
    .pipe(stylelint({
      failAfterError: false,
      reporters: [{ formatter: 'string', console: true }]
    }));
});

// Compile styles
gulp.task('styles', ['styles:lint'], () => {
  return gulp.src('styles/index.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        path.join(__dirname, 'node_modules')
      ]
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      // browsers: See browserlist file
      cascade: false
    }))
    .pipe(rename((path) => {
      path.basename = path.basename === 'index' ? 'styles.bundle' : path.basename;
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/'));
});

// Build JS
gulp.task('js', ['js:lint', 'js:test'], () => {
  // Use the webpack.config.js to manage locations and options.
  return gulp.src('app/index.js')
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('build'));
});

// Assets
gulp.task('assets', () => {
  // Copy a couple files to root for more global support
  gulp.src(['./assets/images/favicons/favicon.ico'])
    .pipe(gulp.dest('build'));

  return gulp.src('assets/**/*')
    .pipe(gulp.dest('build/assets'));
});

// Clean build
gulp.task('clean', () => {
  return del([ 'build/**/*' ]);
});

// Testing ,manully using jest module because
gulp.task('js:test', jest('js:test', {
  rootDir: __dirname,
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['acceptance'],
  setupFiles: [ './tests/globals.js' ]
}));

// TODO: Use https://github.com/GoogleChrome/puppeteer
// gulp.task('js:test:acceptance', jest('js:test:acceptance', {
//   rootDir: __dirname,
//   // Not sure why full path is needed
//   testMatch: [path.join(__dirname, 'tests/acceptance/*.test.js')]
// }));

// Web server for development.  Do build first to ensure something is there.
gulp.task('server', ['build'], () => {<% if (answers.projectType === 'cms' ) { %>
  // Proxy the dev version of news-platform.  (assumes the host file has been set up)
  // https://github.com/MinneapolisStarTribune/news-platform
  //
  // We serve the build files in a way that can be used by the serve_static
  // function in news-platform.  This means that the path is the same, but
  // the domain changes; locally we serve it from here at localhost:3000,
  // but for production it runs from static.startribune.com.
  //
  // news-platform knows about the local domain through the ASSETS_STATIC_URL
  // environment variable.  This can be in a .env file in your locally running
  // news-platform.
  //
  // The publish.production can change location but the "route" option below
  // will need to change so local and production act the same.
  //
  // serve_static function for reference:
  // https://github.com/MinneapolisStarTribune/news-platform/blob/1a56bd11892f79e5d48a9263bed2db7c5539fc60/app/Extensions/helpers/url.php#L272
  //
  // Rewriting:
  // We also utilise the config.json to tell use about any rewriting.  This
  // is so that we can see in a real environment how the content will look
  // on the page.  For instance, a key of "article-lcd-body-content" will
  // look for the following to replace:
  //
  // <div class="article-lcd-body-content">
  //   ...
  // </div><!-- end article-lcd-body-content -->
  //
  // The value of the key is the file in the build directory.
  //
  // "cms": {
  //   "id": "...",
  //   "rewriteMapping": {
  //     "article-lcd-body-content": "_index-content.html"
  //   }
  // },
  let rewriteRules = undefined;
  if (config.cms && config.cms.rewriteMapping) {
    rewriteRules = [];

    _.each(config.cms.rewriteMapping, (component, id) => {
      rewriteRules.push({
        match: new RegExp(
          `<div class="${id}">([\\s\\S]*)<\\/div>\\s*<!-- end ${id} -->`,
          'im'
        ),
        fn: function(request) {
          // Make sure its only for the CMS pages and we have something
          // to replace it with
          if (
            request.originalUrl.indexOf('preview=1&cache=trash') &&
            exists(`build/${component}`)
          ) {
            let inject = fs.readFileSync(`build/${component}`, 'utf-8');

            // Handle rewriting any production path urls for build
            inject = inject.replace(
              new RegExp(config.publish.production.url, 'ig'),
              '/'
            );

            return `<div class="${id}">${inject}</div>`;
          }

          return `<div class="${id}">$1</div>`;
        }
      });
    });
  }

  // No CMS, just static server
  if (argv.cms === false) {
    return browserSync.init({
      port: 3000,
      server: './build/',
      files: './build/**/*',
      logLevel: argv.debug ? 'debug' : 'info'
    });
  }

  return browserSync.init({
    port: 3000,
    proxy: 'http://' +
      (argv.mobile ? 'vm-m' : 'vm-www') +
      '.startribune.com/x/' +
      (argv['cms-id'] ? argv['cms-id'] : config.cms.id) +
      '?preview=1&cache=trash',
    serveStatic: [{
      route: '/' + config.publish.production.path,
      dir: './build'
    }],
    files: './build/**/*',
    rewriteRules: rewriteRules,
    logLevel: argv.debug ? 'debug' : 'info'
  });<% } else { %>
  return browserSync.init({
    port: 3000,
    server: './build/',
    files: './build/**/*',
    logLevel: argv.debug ? 'debug' : 'info'
  });<% } %>
});

// Watch for building
gulp.task('watch', () => {
  gulp.watch(['styles/**/*.scss'], ['styles']);
  gulp.watch(['pages/**/*', 'config.*json', 'package.json', 'content.json'], ['html:lint']);
  gulp.watch(['app/**/*', 'config.json'], ['js']);
  gulp.watch(['assets/**/*'], ['assets']);
  gulp.watch(['config.*json'], ['publish:config']);
});

// Publishing
gulp.task('publish', ['publish:token', 'publish:confirm'], gulpPublish.publish(gulp));
gulp.task('publish:token', gulpPublish.createToken(gulp));
gulp.task('publish:config', gulpPublish.buildConfig(gulp));
gulp.task('publish:confirm', gulpPublish.confirmToken(gulp));
gulp.task('publish:open', gulpPublish.openURL(gulp));

// Full build
gulp.task('build', ['publish:config', 'assets', 'html:lint', 'styles', 'js']);
gulp.task('default', ['build']);

// Deploy (build and publish)
gulp.task('deploy', (done) => {
  return runSequence('clean', 'build', 'publish', done);
});
gulp.task('deploy:open', ['publish:open']);

// Server and watching (development)
gulp.task('develop', ['server', 'watch']);

// Help
gulp.task('help', taskListing);

// Check file/fir exists
function exists(file) {
  return fs.existsSync(path.join(__dirname, file));
}
