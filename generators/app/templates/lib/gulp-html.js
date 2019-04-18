/**
 * HTML gulp tasks
 */

// Dependencies
const path = require('path');
//const fs = require('fs-extra');
const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const noopener = require('gulp-noopener');
const htmlhint = require('gulp-htmlhint');
const a11y = require('gulp-a11y');
const notify = require('gulp-notify');
const _ = require('lodash');
const transform = require('gulp-transform');
const { airSupply } = require('air-supply');
//const { argv } = require('yargs');
const configUtil = require('./config.js');

// Register svelte includes
require('svelte/ssr/register')({
  extensions: ['.html', '.svelte', '.svelte.html'],
  generate: 'ssr',
  hydratable: true,
  preserveComments: true
});

// Get data
async function getData() {
  // Get config
  // let { config } = configUtil.getConfig();
  let a = airSupply();
  return await a.supply();
}

// Renders pages with Svelte.
async function htmlSvelte() {
  let { config } = configUtil.getConfig();
  let data = await getData();
  let pagesDir = path.join(process.cwd(), 'templates');

  // Get list of templates that may be used in browserSync's
  // rewrite mapping.
  let rewrites = [];
  if (config.cms && config.cms.pages) {
    config.cms.pages.forEach(p => {
      rewrites.push(
        p.articleContentTemplate
          ? `templates/${p.articleContentTemplate}.svelte.html`
          : `templates/_${p.id}-content.svelte.html`
      );
      if (p.rewriteMapping) {
        rewrites = rewrites.concat(
          _.map(
            _.values(p.rewriteMapping),
            v => `templates/${v.replace(/\.html/, '.svelte.html')}`
          )
        );
      }
    });
  }

  return gulp
    .src(_.filter(_.flatten(['templates/**/!(_)*.svelte.html', rewrites])), {
      allowEmpty: true
    })
    .pipe(
      transform('utf8', (content, file) => {
        // Clear cache first, otherwise watching won't work
        clearRequireCache(pagesDir);
        let s = require(file.path);
        let d = _.cloneDeep(data);

        // Update some data based on template
        d.id = path.basename(file.path, '.svelte.html');
        d.cms =
          (config.cms && config.cms.pages
            ? _.find(config.cms.pages, { id: d.id })
            : {}) || {};

        // Render
        let r = s.render(d);

        // for the includes, we don't want to add the page wrapper.
        return isInclude(file.path)
          ? `${r.css ? r.css.code : ''} ${r.html}`
          : sveltePage(r);
      })
    )
    .on(
      'error',
      notify.onError(error => {
        return 'Error compiling Svelte HTML: ' + error.message;
      })
    )
    .on('error', e => {
      // Make more helpful output
      let output = `${e.message}\n`;

      if (e.frame) {
        output += `\nFile: ${e.filename}\n${e.frame}\n`;
      }

      if (e.stack) {
        output += `\n${e.stack}\n`;
      }

      gutil.log(gutil.colors.red(`\n${output}`));
    })
    .pipe(
      rename(function(path) {
        path.basename = path.basename
          .replace(/^_/, 'rewrites/_')
          .replace('.svelte', '');
      })
    )
    .pipe(gulp.dest('build/'));
}
htmlSvelte.description =
  'Main function to build HTML files.  Utilizes Svelte to build components.';
htmlSvelte.flags = {
  '--no-cache': 'Ignores cache in collecting the build data.'
};

// Simple linting, meant for live building
function lintSimple() {
  return gulp
    .src('build/**/!(_)*.html')
    .pipe(noopener.warn())
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter('htmlhint-stylish'));
}
lintSimple.description =
  'Simple HTML linting meant for quick building processes.  Assumes HTML is built in the build folder.';

// Full HTML linting
function lint() {
  return gulp
    .src('build/**/!(_)*.html')
    .pipe(noopener.warn())
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter())
    .pipe(a11y())
    .pipe(a11y.reporter());
}
lint.description =
  'Full HTML linting, including accessibility linting.  Assumes HTML is built in the build folder.';

// Make full html from svelte render
function sveltePage({ html, head, css }) {
  return `<!doctype html>
<html lang="en">
	<head>
    ${head}

		<style>
			${css.code}
		</style>
  </head>

	<body>
		${html}
	</body>
</html>
`;
}

// Clear require cache
function clearRequireCache(prefix) {
  if (prefix) {
    _.each(require.cache, (c, ci) => {
      if (ci.indexOf(prefix) === 0) {
        delete require.cache[ci];
      }
    });
  }
}

// Determine if a path is an include, prefix with _
function isInclude(filepath) {
  return filepath ? filepath.split('/').pop()[0] === '_' : false;
}

// Exports
module.exports = {
  getData,
  htmlSvelte,
  lint,
  lintSimple
};
