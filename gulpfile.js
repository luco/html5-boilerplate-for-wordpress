// REQUIRES

var gulp = require('gulp');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var consolidate = require('gulp-consolidate')
var iconfont = require('gulp-iconfont');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

// VARS

var baseScss = 'scss/base.scss';
var scssFiles = 'scss/*.scss';
var cssDest = 'scss';


// Options for development
var sassDevOptions = {
  outputStyle: 'compressed'
}

gulp.task('sass', function() {
  return gulp.src(baseScss)
    .pipe(sourcemaps.init())
    .pipe(sass(sassDevOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(cssDest))
    .pipe(livereload());
});



// ICONS

gulp.task('iconfont', function() {
  return gulp.src('scss/icons/src/*.svg')
          .pipe(iconfont({
              fontName: 'icons',
              formats: ['ttf', 'eot', 'woff', 'woff2'],
              appendCodepoints: true,
              appendUnicode: false,
              normalize: true,
              fontHeight: 1000,
              centerHorizontally: true
          }))
          .on('glyphs', function (glyphs, options) {
              gulp.src('scss/icons/src/template.css')
                  .pipe(consolidate('underscore', {
                      glyphs: glyphs,
                      fontName: options.fontName,
                      fontDate: new Date().getTime()
                  }))
                  .pipe(rename('icons.css'))
                  .pipe(gulp.dest('scss/icons/'));
          })
          .pipe(gulp.dest('scss/icons/'));
});


// WATCH

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(scssFiles, ['sass']);
  gulp.watch('scss/icons/**/*.svg', ['svgWatcher']);
  gulp.watch('*.php', livereload.reload);
  gulp.watch('templates/*.php', livereload.reload);
});

// DEFAULT

gulp.task('default', ['sass', 'iconfont', 'watch']);
gulp.task('svgWatcher', ['iconfont'], function() {
    gulp.start('sass');
});
