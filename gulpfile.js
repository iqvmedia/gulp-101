var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    cssnano = require('gulp-cssnano'),
    csso = require('gulp-csso'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer'),
    htmlmin = require('gulp-htmlmin'),
    concat = require('gulp-concat'),
    critical = require('critical'),
    if = require('gulp-if'),
    zip = require('gulp-zip');

// Static Server + watching scss/html files
gulp.task('default', ['css', 'scripts'], function() {
    browserSync.init({
        server: "./app"
    });
    gulp.watch("scss/**/*.scss", ['css']);
    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch("app/js/*.js", ['scripts']).on('change', browserSync.reload);
    gulp.watch("./*.html", ['html']);
});

gulp.task('css', function() {
    return gulp.src('scss/**/*.scss')
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cssnano())        
        .pipe(csso())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());
});

gulp.task('image', function(){
    gulp.src('img/*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 7,
            svgoPlugins: [{ removeViewBox: false }],
            verbose: true,
            use: []
        }))
        .pipe(gulp.dest('app/img'));
});

gulp.task('build', ['html']);

// Generate & Inline Critical-path CSS
gulp.task('critical', ['build'], function (cb) {
    critical.generate({
        inline: true,
        base: 'app/',
        src: 'index.html',
        dest: 'dist/index-critical.html',
        width: 320,
        height: 480,
        minify: true
    });
});

gulp.task('scripts', function () {
    return gulp.src('app/js/*.js')
        .pipe(sourcemaps.init())
            .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/js/dist/'));
});

gulp.task('html', function () {
    return gulp.src('./*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('app'));
});

gulp.task('development', function () {
    return gulp.src('app/css/main.css')
        .pipe(csso({
            restructure: false,
            sourceMap: true,
            debug: true
        }))
    .pipe(gulp.dest('./out'));
});