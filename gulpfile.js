// Определяем переменную "preprocessor"
let preprocessor = 'sass'; // Выбор препроцессора в проекте - sass или less
// Определяем константы Gulp
const {
	src,
	dest,
	parallel,
	series,
	watch
} = require('gulp');


const browserSync = require('browser-sync').create(); // Подключаем Browsersync
const concat = require('gulp-concat'); // Подключаем gulp-concat
const uglify = require('gulp-uglify-es').default; // Подключаем gulp-uglify-es
const sass = require('gulp-sass')(require('sass')); // Подключаем модули gulp-sass и gulp-less
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer'); // Подключаем Autoprefixer
const cleancss = require('gulp-clean-css'); // Подключаем модуль gulp-clean-css
const imagecomp = require('compress-images'); // Подключаем compress-images для работы с изображениями
const del = require('del'); // Подключаем модуль del
//
var postcss = require("gulp-postcss");
var tailwindcss = require('tailwindcss');
var sourcemaps = require('gulp-sourcemaps');
// var uglify = require('gulp-uglify');
// var autoprefixer = require('autoprefixer');



// Определяем логику работы Browsersync
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: {
			baseDir: 'app/'
		}, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true // Режим работы: true или false
	})
}

function scripts() {
	return src([ // Берем файлы из источников
			'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
			'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
		.pipe(concat('app.min.js')) // Конкатенируем в один файл
		.pipe(uglify()) // Сжимаем JavaScript
		.pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function style(){
	return src('app/' + preprocessor + '/main.' + preprocessor + '')
	// .pipe(sourcemaps.init())
	.pipe(eval(preprocessor)())
    .pipe(postcss())
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 10 versions'],
	})) // Создадим префиксы с помощью Autoprefixer
	// .pipe(cleancss({
	// 	level: {
	// 		1: {
	// 			specialComments: 0
	// 		}
	// 	} /* , format: 'beautify' */
	// })) // Минифицируем стили
    .pipe(dest("./app/css"))
    .pipe(browserSync.stream());
}



async function images() {
	imagecomp(
		"app/images/src/**/*", // Берём все изображения из папки источника
		"app/images/dest/", // Выгружаем оптимизированные изображения в папку назначения
		{
			compress_force: false,
			statistic: true,
			autoupdate: true
		}, false, // Настраиваем основные параметры
		{
			jpg: {
				engine: "mozjpeg",
				command: ["-quality", "75"]
			}
		}, // Сжимаем и оптимизируем изображеня
		{
			png: {
				engine: "pngquant",
				command: ["--quality=75-100", "-o"]
			}
		}, {
			svg: {
				engine: "svgo",
				command: "--multipass"
			}
		}, {
			gif: {
				engine: "gifsicle",
				command: ["--colors", "64", "--use-col=web"]
			}
		},
		function (err, completed) { // Обновляем страницу по завершению
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}
function cleanimg() {
	return del('app/images/dest/**/*', { force: true }) // Удаляем все содержимое папки "app/images/dest/"
}
function startwatch() {

	// Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);

	// Мониторим файлы препроцессора на изменения
	// watch('app/**/' + preprocessor + '/**/*', styles);
	watch('app/**/' + preprocessor + '/**/*', style);

	watch('app/**/*.html').on('change', browserSync.reload);
	// watch('app/images/src/**/*', images);
}

//build
function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function cleandist() {
	return del('dist/**/*', { force: true }) // Удаляем все содержимое папки "dist/"
}

// экспорты
exports.browsersync = browsersync;

exports.scripts = scripts; // Экспортируем функцию scripts() в таск scripts


exports.style = style; // Экспортируем функцию styles() в таск styles
exports.images = images; // Экспорт функции images() в таск images
exports.cleanimg = cleanimg;// Экспортируем функцию cleanimg() как таск cleanimg

exports.default = parallel(style, scripts, browsersync, startwatch);


exports.build = series(cleandist, style, scripts, images, buildcopy);