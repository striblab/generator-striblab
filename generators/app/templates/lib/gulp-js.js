/**
 * JS tasks
 */

// Dependencies
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gutil = require('gulp-util');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('../webpack.config.js');
const runCommand = require('./gulp-run-command.js');

// JS linter
function lint() {
  return gulp
    .src(['app/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format());
}
lint.description =
  'Runs ESLint on JS files.  See the .eslintrc file for configuration.';

// Getting Jest to run via cli module or manually is :(
function test() {
  return runCommand('./node_modules/.bin/jest', ['tests']);
}
test.description = 'Runs any *.test.js JS tests via Jest.';

// Main JS task, just runs webpack
function js() {
  return (
    gulp
      // src is arbitrary?
      .src('app/index.js')
      .pipe(webpackStream(webpackConfig, webpack))
      .on('error', function(error) {
        gutil.log(gutil.colors.red(error.message));
        this.emit('end');
      })
      .pipe(gulp.dest('build'))
  );
}
js.description =
  'Main build for JS; uses webpack.  See webpack.config.js for configuration.';

// Exports
module.exports = {
  lint,
  test,
  js
};
