// Gulp plugins:
var gulp = require("gulp"),
    jade = require("gulp-jade"),
    stylus = require("gulp-stylus"),
    nib = require("nib"),
    changed = require("gulp-changed"),
    prefix = require("gulp-autoprefixer"),
    browserSync = require("browser-sync");

// Useful globs in handy variables:
var markupSrc = ["source/markup/*.jade", "!source/markup/_layout.jade", "!source/markup/partials{,/**}"],
    stylesSrc = ["source/stylesheets/*.styl", "!source/stylesheets/partials{,/**}", "!source/stylesheets/modules{,/**}"],
    jsSrc     = ["source/javascript/*.js", "!source/javascript/vendor{,/**}"],
    imagesSrc = "source/images/**/*.*",
    auxSrc    = ["source/**/*.json"]; // This glob is for dummy data files and such

// Aaaand we start taskin’
// By default, we build, serve, and watch for changes:
gulp.task("default", ["build", "browser-sync"], function () {
  gulp.watch(markupSrc[0], ["markup"]);
  gulp.watch(stylesSrc[0], ["styles"]);
  gulp.watch(jsSrc[0], ["javascript"]);
  gulp.watch(imagesSrc, ["images"]);
  gulp.watch(auxSrc, ["auxiliary"]);
});

// Build the site:
gulp.task("build", ["markup", "styles", "javascript", "images", "auxiliary"], function () {});

// Generate markup:
gulp.task("markup", function () {
  gulp.src(markupSrc)
  .pipe(jade({
    pretty: true
  }))
  .pipe(gulp.dest("build/"));
});

// Generate styles, add prefixes:
gulp.task("styles", function () {
  gulp.src(stylesSrc)
  .pipe(stylus({
    use: [nib()]
  }))
  .pipe(prefix("last 2 versions", "> 1%"))
  .pipe(gulp.dest("build/stylesheets"));
});

// Copy javascript:
gulp.task("javascript", function () {
  gulp.src(jsSrc)
  .pipe(gulp.dest("build/javascript"));
});
// TO-DO: Implement hinting & collation.

// Copy images to build dir:
gulp.task("images", function () {
  gulp.src(imagesSrc)
  .pipe(gulp.dest("build/images"));
});

// Copy additional files:
// (useful for .json and other dummy data files)
gulp.task("auxiliary", function () {
  gulp.src(auxSrc)
  .pipe(gulp.dest("build/"));
});

// Init browser-sync & watch generated files:
gulp.task("browser-sync", function () {
  browserSync.init(null, {
    server: {
      baseDir: "./build"
    },
    files: [
      "build/**/*.html",
      "build/**/*.css",
      "build/**/*.js"
    ],
    browser: "google chrome"
  });
});
