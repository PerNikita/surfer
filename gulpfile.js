const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass")); // Используем dart-sass
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const del = require("del");
const autoprefixer = require("gulp-autoprefixer");

// Очистка папки dist
function clean() {
  return del("dist");
}

// Компиляция SCSS в CSS
function scssTask() {
  return gulp
    .src("app/scss/**/*.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 8 versions"], // Обновленный синтаксис
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
}

// Сборка сторонних CSS файлов
function cssTask() {
  return gulp
    .src([
      "node_modules/normalize.css/normalize.css",
      "node_modules/slick-carousel/slick/slick.css",
      "node_modules/animate.css/animate.css",
    ])
    .pipe(concat("_libs.scss"))
    .pipe(gulp.dest("app/scss"))
    .pipe(browserSync.stream());
}

// Обработка HTML файлов
function htmlTask() {
  return gulp.src("app/*.html").pipe(browserSync.reload({ stream: true }));
}

// Обработка JavaScript файлов
function jsTask() {
  return gulp
    .src(["node_modules/slick-carousel/slick/slick.js"])
    .pipe(concat("libs.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("app/js"))
    .pipe(browserSync.reload({ stream: true }));
}

// Запуск BrowserSync
function browserSyncTask() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

// Экспорт проекта в папку dist
function exportTask() {
  const buildHtml = gulp.src("app/**/*.html").pipe(gulp.dest("dist"));
  const buildCss = gulp.src("app/css/**/*.css").pipe(gulp.dest("dist/css"));
  const buildJs = gulp.src("app/js/**/*.js").pipe(gulp.dest("dist/js"));
  const buildFonts = gulp.src("app/fonts/**/*.*").pipe(gulp.dest("dist/fonts"));
  const buildImg = gulp.src("app/img/**/*.*").pipe(gulp.dest("dist/img"));

  return Promise.all([buildHtml, buildCss, buildJs, buildFonts, buildImg]);
}

// Наблюдение за изменениями файлов
function watchTask() {
  gulp.watch("app/scss/**/*.scss", scssTask);
  gulp.watch("app/*.html", htmlTask);
  gulp.watch("app/js/*.js", gulp.series(jsTask, browserSync.reload));
}

// Определение задач
exports.clean = clean;
exports.scss = scssTask;
exports.css = cssTask;
exports.html = htmlTask;
exports.js = jsTask;
exports.browserSync = browserSyncTask;
exports.export = gulp.series(clean, exportTask);
exports.build = gulp.series(clean, exportTask);
exports.default = gulp.parallel(
  scssTask,
  cssTask,
  jsTask,
  browserSyncTask,
  watchTask
);