const { src, dest, watch, series } = require('gulp');

/**
 * --------------------------------
 * Plugin
 * --------------------------------
 */
const
	fileInclude = require('gulp-file-Include'),
	// cached = require('gulp-cached'),
	del = require('del'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass')(require('sass')),
	sourcemaps = require('gulp-sourcemaps'),
	sassglob = require('gulp-sass-glob'),
	replace = require('gulp-replace'),
	ts = require("gulp-typescript"),
	beautify = require('gulp-beautify'),
	// imagemin = require('gulp-imagemin'),
	svgSprite = require('gulp-svg-sprite'),
	webp = require('gulp-webp'),
	spritesmith = require('gulp.spritesmith'),
	buffer = require('vinyl-buffer'),
	merge = require('merge-stream'),
	brotli = require('gulp-brotli'),
	connect = require('gulp-connect');

/**
 * --------------------------------
 * Dir Settings
 * --------------------------------
 */
const
	dirMain = '..',
	dirSub = '../..',
	dirCss = '';

let
	dirSrc = './public/src',
	dirDist = './public/dist';

	dirSrc = {
		html: {
			all: dirSrc + '/html/**/*.html',
			main: dirSrc + '/html/pages/*.html',
			sub: [
					dirSrc + '/html/pages/**/*.html',
					'!' + dirSrc + '/html/*.html',
					'!' + dirSrc + '/html/shared/**/*.html',
					'!' + dirSrc + '/html/components/**/*.html',
					'!' + dirSrc + '/html/popup/**/*.html',
					'!' + dirSrc + '/html/contents/**/*.html'
				]
		},

		css: {
			all: [
				dirSrc + '/resources/css/**/*.scss',
				'!' + dirSrc + '/resources/css/**/icon.css'
			],
			lib: dirSrc + '/resources/css/lib/*.scss',
			common: dirSrc + '/resources/css/common.scss',
			main: dirSrc + '/resources/css/home.scss',
			sub: dirSrc + '/resources/css/sub.scss',
		},

		fonts: {
			all: dirSrc + '/resources/fonts/**/*'
		},

		js: {
			all: dirSrc + '/resources/js/**/*.js',
			ts: dirSrc + '/resources/js/**/*.ts'
		},

		img: {
			all: [
				dirSrc + '/resources/images/**/*',
				'!' + dirSrc + '/resources/images/icon/*',
				'!' + dirSrc + '/resources/images/**/*.svg'
			],
			icon: dirSrc + '/resources/images/icon/*',
			svg: dirSrc + '/resources/images/**/*.svg'
		}
	};

/**
 * --------------------------------
 * HTML Build
 * --------------------------------
 */
const htmlClean = () => {
	return del(dirDist + '/html/');
}

const htmlMainBuild = () => {
	return src(dirSrc.html.main)
		.pipe(fileInclude({
			prefix: '{{',
			suffix: '}}',
			basepath: './public/src/html/'
		}))
		.pipe(replace('{{dirRoot}}', dirMain))
		.pipe(beautify.html({
			indent_char: '	',
			max_preserve_newlines: 1,
			indent_scripts: 'separate'
		}))
		.pipe(dest(dirDist + '/html/'));
}

const htmlSubBuild = () => {
	return src(dirSrc.html.sub)
		.pipe(fileInclude({
			prefix: '{{',
			suffix: '}}',
			basepath: './public/src/html/'
		}))
		.pipe(replace('{{dirRoot}}', dirSub))
		.pipe(beautify.html({
			indent_char: '	',
			max_preserve_newlines: 1,
			indent_scripts: 'separate'
		}))
		.pipe(dest(dirDist + '/html/'));
}

/**
 * --------------------------------
 * CSS Build
 * --------------------------------
 */
const cssClean = () => {
	return del(dirDist + '/resources/css/');
}

const cssBuild = () => {
    return src(dirSrc.css.all)
		.pipe(sourcemaps.init())
		.pipe(sassglob())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(sourcemaps.write('./maps'))
		.pipe(replace('{{dirRoot}}', dirCss))
		.pipe(brotli.compress())
		.pipe(dest(dirDist + '/resources/css/'));
}

/**
 * --------------------------------
 * JS Build
 * --------------------------------
 */
const jsClean = () => {
	return del(dirDist + '/resources/js/');
}

const jsBuild = () => {
    return src(dirSrc.js.all)
		.pipe(brotli.compress())
		.pipe(dest(dirDist + '/resources/js/'));
}

const tsProject = ts.createProject('./tsconfig.json');

const tsBuild = () => {
    return src(dirSrc.js.ts)
		.pipe(tsProject())
		.pipe(brotli.compress())
		.pipe(dest(dirDist + '/resources/js/'));
}

/**
 * --------------------------------
 * Images Build
 * --------------------------------
 */
const imgClean = () => {
	return del(dirDist + '/resources/images/');
}

const imgBuild = () => {
    return src(dirSrc.img.all)
		// .pipe(imagemin([
		// 	// imagemin.gifsicle({interlaced: true}),
		// 	// imagemin.mozjpeg({quality: 75, progressive: true}),
		// 	// imagemin.optipng({optimizationLevel: 5}),
		// 	imagemin.svgo({
		// 		plugins: [
		// 			{removeViewBox: true},
		// 			{cleanupIDs: false}
		// 		]
		// 	})
		// ]))
		.pipe(webp())
		.pipe(dest(dirDist + '/resources/images/'));
}

const iconBuild = () => {
	const iconData = src([
			dirSrc.img.icon,
			'!' + dirSrc.img.icon + '*.svg'
		])
		.pipe(spritesmith({
			imgName: '/resources/images/common/icon.webp',
			cssName: 'icon.css'
		}))
			
	return merge(
		iconData.img
			.pipe(buffer())
			.pipe(webp())
			.pipe(dest(dirDist + '/resources/')),
		iconData.css
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(brotli.compress())
			.pipe(dest(dirDist + '/resources/css/'))
	);
}

const svgBuild = () => {
    return src(dirSrc.img.svg)
		.pipe(brotli.compress())
		.pipe(dest(dirDist + '/resources/images/'));
}

/**
 * --------------------------------
 * Fonts Build
 * --------------------------------
 */
const fontsClean = () => {
	return del(dirDist + '/resources/fonts/');
}

const fontsBuild = () => {
	return src(dirSrc.fonts.all)
		.pipe(dest(dirDist + '/resources/fonts/'));
}

/**
 * --------------------------------
 * Server
 * --------------------------------
 */
 const cors = (req, res, next) => {
	if (req.url.indexOf('.js') !== -1) {
		req.url = req.url + '.br'; 
		res.setHeader('Content-Encoding', 'br');
		res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
	}

	if (req.url.indexOf('.min.css') != -1) {
		req.url = req.url + '.br'; 
		res.setHeader('Content-Encoding', 'br');
		res.setHeader('Content-Type', 'text/css; charset=UTF-8');
	}

	if (req.url.indexOf('.svg') != -1) {
		req.url = req.url + '.br'; 
		res.setHeader('Content-Encoding', 'br');
		res.setHeader('Content-Type', 'image/svg+xml');
	}

	next();
};

const server = async () => {
	connect.server({
		root: dirDist,
		port:'1000',
		host: 'localhost',
		middleware: (req, res, next) => {
			return [cors];
		}
	});
}

/**
 * --------------------------------
 * Watch
 * --------------------------------
 */
const watcher = () => {
	watch('./public/src/html/**/*.html', series(htmlClean, htmlMainBuild, htmlSubBuild));
	watch('./public/src/resources/css/**/*', series(cssClean, cssBuild, iconBuild));
	watch('./public/src/resources/js/**/*', series(jsClean, jsBuild, tsBuild));
	watch('./public/src/resources/images/**/*', series(imgClean, imgBuild, svgBuild));
	watch('./public/src/resources/sprite/**/*', series(iconBuild));
	// watch('./public/src/resources/sprite/**/*.svg', series(iconSvgBuild));
	watch('./public/src/resources/fonts/**/*', series(fontsClean, fontsBuild));
}

/**
 * --------------------------------
 * Gulp Build
 * --------------------------------
 */
exports.build = series(
		htmlClean, htmlMainBuild, htmlSubBuild,
		cssClean, cssBuild,
		jsClean, jsBuild, tsBuild,
		imgClean, imgBuild, svgBuild,
		iconBuild,
		// iconSvgBuild,
		fontsClean, fontsBuild,
		server,
		watcher
	);