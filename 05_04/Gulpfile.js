var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    precss = require('precss'),
    image = require('gulp-image'),
    htmlmin = require('gulp-htmlmin'),
    minify = require('gulp-minify'),
    cssnano = require('cssnano'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    revDel = require('rev-del'),

    limbo = 'limbo/',
    source = 'development/',
    dest = 'production/';

// Optimize images through gulp-image
gulp.task('imageoptim', function() {
    gulp.src(source + 'images/**/*.{jpg,JPG}')
    .pipe(image())
    .pipe(gulp.dest(dest + 'images'));
});


// HTML
gulp.task('html', function() {
    return gulp.src(source + '*.html')
    .pipe(htmlmin({
        collapseWhitespace: true,
        minifyJS: true,
        removeComments: true
    }))
    .pipe(gulp.dest(limbo));
});

// JavaScript
gulp.task('javascript', function() {
    return gulp.src(source + 'JS/**/*.js')
    .pipe(minify({
        // exclude the libs directory from minification
        exclude: ['libs']
    }))
    .pipe(gulp.dest(limbo + 'JS'));
});

// CSS
gulp.task('css', function() {
    return gulp.src(source + '**/*.css')
    .pipe(postcss([
        precss(),
        autoprefixer(),
        cssnano()
    ]))
    .pipe(gulp.dest(limbo));
});

// Rename assets based on content cache
gulp.task('revision', ['html','css','javascript'], function() {
    return gulp.src(limbo + '**/*.{js,css}')
    .pipe(rev())
    .pipe(gulp.dest(dest))
    .pipe(rev.manifest())
    .pipe(revDel({dest: dest}))
    .pipe(gulp.dest(dest));
});

// Replace URLs with hashed ones based on rev manifest.
// Runs immediately after revision:
gulp.task('revreplace', ['revision'], function() {
    var manifest = gulp.src(dest + 'rev-manifest.json');

    return gulp.src(limbo + '**/*.html')
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest(dest));
});

// Watch everything
gulp.task('watch', function() {
    gulp.watch(source + '**/*.{html,css,js}', ['revreplace']);
    gulp.watch(source + 'images/**/*.{jpg,JPG}', ['imageoptim']);
});

// Run a livereload web server because lazy
gulp.task('webserver', function() {
    gulp.src(dest)
    .pipe(webserver({
        livereload: true,
        open: true
    }));
});

// Default task (runs at initiation: gulp --verbose)
gulp.task('default', ['imageoptim', 'revreplace', 'watch', 'webserver']);
