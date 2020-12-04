// REQUIRES

const { watch, series, parallel, src, dest } = require('gulp');
const livereload = require('gulp-livereload');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const consolidate = require('gulp-consolidate');
const rename = require('gulp-rename');
const iconfont = require('gulp-iconfont');

//
// VARS
//

const paths = {
  php: '**/**/*.php',
  scss: 'scss/**/**/*.scss',
  scssBase: 'scss/base.scss',
  scssDest: 'scss',
  icons: 'scss/icons',
};

const sassOptions = {
  outputStyle: 'compressed'
}


//
// GENERATORS
//

function generateSass(done) {
  return src(paths.scssBase)
    .pipe(sourcemaps.init())
    .pipe(
      sass(sassOptions)
      .on('error', sass.logError)
    )
    .pipe(sourcemaps.write('./'))
    .pipe(dest(paths.scssDest));
}

function generateIcons() {
    return src(paths.icons+'/src/*.svg')
    .pipe(iconfont({
              fontName: 'icons',
              formats: ['ttf', 'eot', 'woff', 'woff2'],
              prependUnicode: false,
              normalize: true,
              fontHeight: 1000,
              centerHorizontally: true
    }))
    .on('glyphs', function (glyphs, options) {
            src(paths.icons+'/src/template.css')
            .pipe(consolidate('underscore', {
                glyphs: glyphs,
                fontName: options.fontName,
                fontDate: new Date().getTime()
            }))
            .pipe(rename('icons.css'))
            .pipe(dest(paths.icons));
    })
    .pipe(dest(paths.icons));
}


// FUNCTIONS

function generateFiles(done) {
  return series(generateSass, generateIcons)(done);
}

function watchFiles() {

    livereload.listen();

    // Watch SCSS    
    watch(paths.scss)
    .on('change', series(generateSass, (done) => {
        livereload.reload();
        done();
    }));

    // Watch Icons
    watch(paths.icons+'/src/*.svg')
    .on('change', series(generateIcons, generateSass, (done) => {
        livereload.reload();
        done();
    }));

    // Watch PHP
    watch(paths.php).on('change', () => {
           livereload.reload();
    });

}


exports.default = series(generateFiles, watchFiles);
