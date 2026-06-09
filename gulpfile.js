// REQUIRES

const fs = require("fs");
const { watch, series, parallel, src, dest } = require("gulp");
const livereload = require("gulp-livereload");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const consolidate = require("gulp-consolidate");
const rename = require("gulp-rename");
const iconfont = require("gulp-iconfont");

const paths = {
	php: ["./*.php", "./template-parts/**/*.php", "./inc/**/*.php"],
	icons: "scss/icons",
};
//
// GENERATORS
//

function generateSass(done) {
	return src("scss/*.css").pipe(livereload());
}

function generateIcons() {
	return src(paths.icons + "/src/*.svg")
		.pipe(
			iconfont({
				fontName: "icons",
				formats: ["ttf", "eot", "woff", "woff2"],
				prependUnicode: false,
				normalize: true,
				fontHeight: 1001,
				centerHorizontally: true,
			})
		)
		.on("glyphs", function (glyphs, options) {
			src(paths.icons + "/src/template.css")
				.pipe(
					consolidate("underscore", {
						glyphs: glyphs,
						fontName: options.fontName,
						fontDate: new Date().getTime(),
					})
				)
				.pipe(rename("icons.css"))
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

	// Watch SCSS (exclude main.css to avoid re-triggering after addTimestamp writes to it)
	watch(["scss/*.css"]).on(
		"change",
		series(generateSass, (done) => {
			done();
		})
	);

	// Watch Icons
	watch(paths.icons + "/src/*.svg").on(
		"change",
		series(generateIcons, generateSass, (done) => {
			done();
		})
	);

	// Watch PHP
	watch(paths.php, {
		ignored: "/node_modules/**",
	}).on("change", () => {
		livereload.reload();
	});
}

exports.default = series(generateFiles, watchFiles);
