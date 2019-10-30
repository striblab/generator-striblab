// dependencies
var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var minifycss = require('gulp-clean-css');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var neat = require('node-neat');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var ssi = require('browsersync-ssi');
var gulpMerge = require('gulp-merge');
var replace = require('gulp-replace');
var reload = browserSync.reload;
var desktopShare = '<aside class="article-share"> <div class="share__comments clickQS"> <a href="#comments" data-linkname="Comment on this story" data-linktype="share-comment" data-modulename="Article" data-moduletype="-" data-position="-1-share"> <div class="share-icon"></div><div class="share-label"> <span class="share-txt">comment</span><span class="share-count"></span> </div></a> </div><div class="share__facebook clickQS"> <a class="st-share-link" data-st-share-count-selector=".share-count-facebook" data-st-share-service="facebook" data-st-share-url="http://strib.mn/2v4eMKe" target="_blank" data-linkname="Share on Facebook" data-linktype="share-facebook" data-modulename="Article" data-moduletype="-" data-position="-1-share"> <div class="share-icon"></div><div class="share-label"> <span class="share-txt">share</span><span class="share-count-facebook"></span> </div></a> </div><div class="share__twitter clickQS"> <a class="st-share-link" data-st-share-count-selector=".share-count-twitter" data-st-share-image="" data-st-share-title="Article body test" data-st-share-service="twitter" data-st-share-url="http://strib.mn/2v4eMKe" data-st-count-url="http://www.startribune.com/article-body-test/433631533/" target="_blank" data-linkname="Share on Twitter" data-linktype="share-twitter" data-modulename="Article" data-moduletype="-" data-position="-2-share"> <div class="share-icon"></div><div class="share-label"> <span class="share-txt">tweet</span><span class="share-count-twitter"></span> </div></a> </div><div class="share__email clickQS"> <a href="http://scripts.startribune.com/email_article/?section=%2F&amp;story_id=433631533&amp;headline=Article+body+test" id="js-email-share-btn" data-id="433631533" data-linkname="Email" data-linktype="share-email" data-modulename="Article" data-moduletype="-" data-position="-3-share"> <div class="share-icon"></div><div class="share-label"> <span>email</span> </div></a> </div><div class="share__print clickQS"> <a id="js-print-btn" data-linkname="Print" data-linktype="share-comment" data-modulename="Article" data-moduletype="-" data-position="-3-share"> <div class="share-icon"></div><div class="share-label"> <span>Print</span> </div></a> </div><div class="share-more"> <div class="share-label">more</div><div class="share-more-popover"> <div class="share-more-group"> <span class="share-more-label">Share on:</span> <a class="st-share-link linkedin-pw-placeholder" data-st-share-service="linkedin" data-st-share-url="http://strib.mn/2v4eMKe" data-st-share-title="Article body test" data-st-share-summary="" data-st-share-source="Star Tribune" target="_blank" data-linkname="Share on LinkedIn" data-linktype="share-linkedin" data-modulename="Article" data-moduletype="-" data-position="-3-share"><span class="share-more-icon share__linkedin">Share on LinkedIn</span></a> <a class="st-share-link googleplus-pw-placeholder" data-st-share-service="googleplus" data-st-share-url="http://strib.mn/2v4eMKe" target="_blank" data-linkname="Share on Google+" data-linktype="share-linkedin" data-modulename="Article" data-moduletype="-" data-position="-4-share"><span class="share-more-icon share__googleplus">Share on Google+</span></a> <a class="st-share-link pinterest-pw-placeholder" data-st-share-service="pinterest" data-st-share-image="" data-st-share-description="" data-st-share-url="http://strib.mn/2v4eMKe" target="_blank" data-linkname="Share on Pinterest" data-linktype="share-pinterest" data-modulename="Article" data-moduletype="-" data-position="-5-share"><span class="share-more-icon share__pinterest">Share on Pinterest</span></a> </div><div class="share-more-group"> <span class="share-more-label">Copy shortlink:</span> <input class="share-more-link-input" id="MoreShortlink" type="text" value="http://strib.mn/2v4eMKe"/> </div><div class="share-more-group"> <span class="share-more-label">Purchase:</span> <a href="http://reprints.ygsgroup.com/m/startribune/" target="_blank" class="share-more-tool tool__orderreprint" data-linkname="Order Reprint" data-linktype="share-reprint" data-modulename="Article" data-moduletype="-" data-position="-6-share" >Order Reprint</a> </div></div></div></aside> <script type="text/javascript">var pwidget_config={copypaste: false, shareQuote: false}; </script> <script src="http://i.po.st/share/script/post-widget.js#publisherKey=56d2hkmk6d6lmd6llqb2" type="text/javascript"></script> <link rel="stylesheet" href="http://www.startribune.com/static/css/vendor/post-share-widget.css">';
var mobileShare = ' <ul class="article-tools nav body-sharing-top"> <li class="tool float--right"> <a href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fstrib.mn%2F2v4eMKe" title="facebook" data-eVar47="1" data-linkname="Share on Facebook - Top" data-eVar58="share-facebook"> <span class="icon-facebook-light social-sharing facebook"></span> </a> </li><li class="tool float--right"> <a href="https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Fstrib.mn%2F2v4eMKe&text=Article%20body%20test&tw_p=tweetbutton&url=http%3A%2F%2Fstrib.mn%2F2v4eMKe" title="twitter" data-eVar47="2" data-linkname="Share on Twitter - Top" data-eVar58="share-twitter"> <span class="icon-twitter-light social-sharing twitter twitterPage"></span> </a> </li></ul> <script type="text/javascript">$(document).ready(function($){var shareURI; var osData=window.getMobileOSAndVersion(); var shareBody="Article%20body%20test: http%3A%2F%2Fstrib.mn%2F2v4eMKe"; if (osData.os=="iOS"){if (osData.version >=8){shareURI="sms:&body=" + shareBody;}else{shareURI="sms:;body=" + shareBody;}}else{shareURI="sms:?body=" + shareBody;}$("#share-sms-link-top").attr("href", shareURI);}); </script>';
/* Setup scss path */
var paths = {
    scss: 'src/sass/*.scss'
};

// manage scripts

gulp.task('scripts', function() {
    return gulp.src([
            /* Add your JS files here, they will be combined in this order */
            './src/js/*.js'
        ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./public/js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./public/js'))

    // reload browser after js changes

    .pipe(reload({
        stream: true
    }));
});

gulp.task('content', function() {
    return gulp.src([
            './src/content/*.html'
        ])
        .pipe(gulp.dest('./public/content'));
});

gulp.task('js-frags', function() {
    return gulp.src([
            './src/js/*.txt'
        ])
        .pipe(gulp.dest('./public/js'));
});

gulp.task('includes', function() {
    return gulp.src([
            './src/includes/*.txt'
        ])
        .pipe(gulp.dest('./public/includes'));
});

gulp.task('vendor-scripts', function() {
    return gulp.src([
            // copies plugins from the vendors directory 
            './src/js/vendor/*.js'
        ])
        .pipe(gulp.dest('./public/js/vendor'));
});
gulp.task('vendor-css', function() {
    return gulp.src([
            // copies plugins from the vendors directory 
            './src/css/*.css'
        ])
        .pipe(gulp.dest('./public/css'));
});

// manage SASS

gulp.task('desktopSASS', function() {
    gulp.src('src/scss/desktop.scss')
        .pipe(plumber())
        .pipe(sass({
            includePaths: ['scss'].concat(neat)
        }))
        .pipe(concat('desktop.css'))
        .pipe(gulp.dest('./public/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('./public/css'))

    // reload browser after css changes

    .pipe(reload({
        stream: true
    }));
});

gulp.task('mobileSASS', function() {
    gulp.src('src/scss/mobile.scss')
        .pipe(plumber())
        .pipe(sass({
            includePaths: ['scss'].concat(neat)
        }))
        .pipe(concat('mobile.css'))
        .pipe(gulp.dest('./public/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('./public/css'))

    // reload browser after css changes

    .pipe(reload({
        stream: true
    }));
});

gulp.task('responsiveSASS', function() {
    gulp.src('src/scss/responsive.scss')
        .pipe(plumber())
        .pipe(sass({
            includePaths: ['scss'].concat(neat)
        }))
        .pipe(concat('responsive.css'))
        .pipe(gulp.dest('./public/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('./public/css'))

    // reload browser after css changes

    .pipe(reload({
        stream: true
    }));
});

gulp.task('vendorCSS', function() { // moves vendor css files added to src
    gulp.src('src/css/*.css')
        .pipe(gulp.dest('./public/css'))

        // reload browser after css changes

        .pipe(reload({
        stream: true
    }));
});


// manage preview files

gulp.task('previewDesktop', function () {
  return gulpMerge(
      gulp.src([
        './src/includes/desktop-header.txt',
        './src/content/hero-override.html',
        './src/includes/desktop-hero-override.txt',
        './src/content/desktop.html',
        './src/content/responsive.html',
        './src/includes/desktop-footer.txt'
      ])
    )
    .pipe(concat('desktop.html'))
    .pipe(replace('<!--#include virtual="/public/includes/d-share.txt" -->', desktopShare))
    .pipe(replace('../public/css/', '../css/'))
    .pipe(replace('/public/js', '../js'))
    .pipe(gulp.dest('./public/preview/'));
});

gulp.task('previewDesktopRightRail', function () {
  return gulpMerge(
      gulp.src([
        './src/includes/desktop-right-rail-header.txt',
        './src/content/hero-override.html',
        './src/includes/desktop-right-rail-hero-override.txt',
        './src/content/desktop.html',
        './src/content/responsive.html',
        './src/includes/desktop-right-rail-footer.txt'
      ])
    )
    .pipe(concat('desktop-right-rail.html'))
    .pipe(replace('<!--#include virtual="/public/includes/d-share.txt" -->', desktopShare))
    .pipe(replace('../public/css/', '../css/'))
    .pipe(replace('/public/js', '../js'))
    .pipe(gulp.dest('./public/preview/'));
});

gulp.task('previewMobile', function () {
  return gulpMerge(
      gulp.src([
        './src/includes/mobile-header.txt',
        './src/content/hero-override.html',
        './src/includes/mobile-header-hero-override.txt',
        './src/content/mobile.html',
        './src/content/responsive.html',
        './src/includes/mobile-footer.txt'
      ])
    )
    .pipe(concat('mobile.html'))
    .pipe(replace('<!--#include virtual="/public/includes/d-share.txt" -->', desktopShare))
    .pipe(replace('<!--#include virtual="/public/includes/m-share.txt" -->', mobileShare))
    .pipe(replace('../public/css/', '../css/'))
    .pipe(replace('/public/js', '../js'))
    .pipe(gulp.dest('./public/preview/'));
});

gulp.task('previewDesktopSansHeader', function () {
  return gulpMerge(
      gulp.src([
        './src/includes/desktop-sans-header.txt',
        './src/content/desktop.html',
        './src/content/responsive.html',
        './src/includes/desktop-sans-footer.txt'
      ])
    )
    .pipe(concat('desktop-noHeader.html'))
    .pipe(replace('<!--#include virtual="/public/includes/d-share.txt" -->', desktopShare))
    .pipe(replace('../public/css/', '../css/'))
    .pipe(replace('/public/js', '../js'))
    .pipe(gulp.dest('./public/preview/'));
});

gulp.task('previewMobileSansHeader', function () {
  return gulpMerge(
      gulp.src([
        './src/includes/mobile-sans-header.txt',
        './src/content/mobile.html',
        './src/content/responsive.html',
        './src/includes/mobile-sans-footer.txt'
      ])
    )
    .pipe(concat('mobile-noHeader.html'))
    .pipe(replace('<!--#include virtual="/public/includes/d-share.txt" -->', desktopShare))
    .pipe(replace('<!--#include virtual="/public/includes/m-share.txt" -->', mobileShare))
    .pipe(replace('../public/css/', '../css/'))
    .pipe(replace('/public/js', '../js'))
    .pipe(gulp.dest('./public/preview/'));
});


// manage refresh

gulp.task('bs-reload', function() {
    browserSync.reload();
});

// browse-sync preferences

gulp.task('browser-sync', function() {
    browserSync.init(['css/*.css', 'js/*.js'], {
        server: {
            baseDir: ['/'],
            middleware: ssi({
                baseDir: __dirname + '/',
                ext: '.html'
            })
        },
        serveStatic: [{
            route: '/public',
            dir: 'public'
        }]
    });
});

// write out new versions of changed src/css and src/js files

gulp.task('default', ['desktopSASS', 'mobileSASS', 'responsiveSASS', 'browser-sync', 'scripts', 'vendor-scripts', 'vendorCSS', 'content', 'js-frags', 'includes', 'previewDesktop', 'previewDesktopRightRail', 'previewDesktopSansHeader', 'previewMobile', 'previewMobileSansHeader'], function() {
    /* Watch scss, run the sass task on change. */
    gulp.watch(['src/scss/*.scss', 'src/scss/**/*.scss'], ['desktopSASS','mobileSASS','responsiveSASS'])
        /* Watch app.js file, run the scripts task on change. */
    gulp.watch(['src/js/*.js'], ['scripts'])
    gulp.watch(['src/js/vendor/*.js'], ['vendor-scripts'])
    gulp.watch(['src/css/*.css'], ['vendor-css'])
    gulp.watch(['src/includes/*.txt'], ['includes'])
    gulp.watch(['src/content/*.html'], ['content'])
    gulp.watch(['src/js/*.txt'], ['js-frags'])
        /* Watch .html files, run the bs-reload task on change. */
    gulp.watch(['./public/content/*.html'], ['bs-reload']);
    gulp.watch(['./public/content/*.html'], ['previewDesktop']);
    gulp.watch(['./public/content/*.html'], ['previewDesktopRightRail']);
    gulp.watch(['./public/content/*.html'], ['previewMobile']);
    gulp.watch(['./public/content/*.html'], ['previewDesktopSansHeader']);
    gulp.watch(['./public/content/*.html'], ['previewMobileSansHeader']);
    gulp.watch(['./public/content/*.txt'], ['bs-reload']);
    gulp.watch(['./public/js/*.txt'], ['bs-reload']);
});