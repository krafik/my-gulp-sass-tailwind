const {
    watch,
    series,
    src,
    dest
} = require("gulp");
var browserSync = require("browser-sync").create();
var postcss = require("gulp-postcss");
var tailwindcss = require('tailwindcss');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var autoprefixer = require('autoprefixer');
const imagemin = require("gulp-imagemin");

function cssTask(cb) {
    return src("./src/*.css")
    .pipe(sourcemaps.init())
    .pipe(postcss([tailwindcss('./tailwind.config.js'),autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest("./assets/css"))
    .pipe(browserSync.stream());
    cb();
}

function jsTask(cb) {
    return src("./src/*.js").pipe(uglify()).pipe(dest("./assets/js")).pipe(browserSync.stream());
    cb();
}

function imageminTask(cb) {
    return src("./assets/images/*").pipe(imagemin()).pipe(dest("./assets/images"));
    cb();
}

function browsersyncServe(cb) {
    browserSync.init({
        server: {
            baseDir: "./",
        },
    });
    cb();
}

function browsersyncReload(cb) {
    browserSync.reload();
    cb();
}

function watchTask() {
    watch("./**/*.html", browsersyncReload);
    watch(["./src/*.js"], series(jsTask, browsersyncReload));
    watch(["./src/*.css"], series(cssTask, browsersyncReload));
}
exports.default = series(jsTask, cssTask, browsersyncServe, watchTask);
exports.css = cssTask;
exports.js = jsTask;
exports.images = imageminTask;






function styles() {
	return src('app/' + preprocessor + '/main.' + preprocessor + '') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
		.pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
		.pipe(concat('app.min.css')) // Конкатенируем в файл app.min.js
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 10 versions'],
			grid: true
		})) // Создадим префиксы с помощью Autoprefixer
		.pipe(cleancss({
			level: {
				1: {
					specialComments: 0
				}
			} /* , format: 'beautify' */
		})) // Минифицируем стили
		.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
		.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}
exports.styles = styles; // Экспортируем функцию styles() в таск styles
// exports.default = parallel(styles, scripts, browsersync, startwatch);