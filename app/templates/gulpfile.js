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
const path = require('path');
const gulp = require('gulp');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const insecurity = require('gulp-insecurity');
const noopener = require('gulp-noopener');
const eslint = require('gulp-eslint');
const stylelint = require('gulp-stylelint');
const sass = require('gulp-sass');
const htmlhint = require('gulp-htmlhint');
const autoprefixer = require('gulp-autoprefixer');
const include = require('gulp-file-include');
const jest = require('gulp-jest').default;
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const browserSync = require('browser-sync').create();
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const del = require('del');
const gulpContent = require('./lib/gulp-content.js');
const pkg = require('./package.json');
const config = exists('config.custom.json') ? require('./config.custom.json') : require('./config.json');

require('dotenv').load({ silent: true });

// Process base html templates (not templates used in front-end JS)
gulp.task('html', () => {
  const content = exists('content.json') ? require('./content.json') : {};

  return gulp.src(['templates/**/*.ejs.html', '!templates/**/_*.ejs.html'])
    .pipe(include({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(ejs({ config: config, content: content, package: pkg }).on('error', gutil.log))
    .pipe(rename(function(path) {
      path.basename = path.basename.replace('.ejs', '');
    }))
    .pipe(insecurity.html({
      passive: true,
      whitelist: new RegExp(config.linting.urlWhitelist)
    }))
    .pipe(noopener.warn())
    .pipe(gulp.dest('build/'));
});

// Lint HTML (happens after HTML build process).  The "stylish" version
// is more succinct but its less helpful to find issues.
gulp.task('html:lint', ['html'], () => {
  return gulp.src('build/*.html')
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter('htmlhint-stylish'));
});
gulp.task('html:lint:details', ['html'], () => {
  return gulp.src('build/*.html')
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter());
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
      outputStyle: 'compressed'
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

// Testing
gulp.task('js:test', () => {
  return gulp.src('tests/**/*.test.js').pipe(jest({ }));
});

// Web server for development
gulp.task('server', ['build'], () => {
  return browserSync.init({
    port: 3001,
    server: './build/',
    files: './build/**/*'
  });
});

// Watch for building
gulp.task('watch', () => {
  gulp.watch(['styles/**/*.scss'], ['styles']);
  gulp.watch(['templates/**/*', 'config.*json', 'package.json', 'content.json'], ['html:lint']);
  gulp.watch(['app/**/*', 'config.json'], ['js']);
  gulp.watch(['assets/**/*'], ['assets']);
});

// Full build
gulp.task('build', ['assets', 'html:lint', 'styles', 'js']);
gulp.task('default', ['build']);

// Server and watching (development)
gulp.task('develop', ['server', 'watch']);

// Check file/fir exists
function exists(file) {
  return fs.existsSync(path.join(__dirname, file));
}
