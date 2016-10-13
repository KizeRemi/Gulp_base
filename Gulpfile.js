'use strict';

var gulp    = require('gulp'),
jshint      = require('gulp-jshint'),
browserify  = require('gulp-browserify'),
concat      = require('gulp-concat'),
rimraf      = require('gulp-rimraf'),
sass        = require('gulp-sass'),
autoprefixer= require('gulp-autoprefixer'),
jade        = require('gulp-jade'),
pug         = require('gulp-pug'),
iconfont    = require('gulp-iconfont'),
iconfontCss = require('gulp-iconfont-css'),
sourcemaps  = require('gulp-sourcemaps');

// Modules for webserver and livereload
var express   = require('express'),
refresh       = require('gulp-livereload'),
livereload    = require('connect-livereload'),
livereloadport= 35729,
serverport    = 5000;

// Set up an express server (not starting it yet)
var server = express();
// Add live reload
server.use(livereload({port: livereloadport}));
// Use our 'dist' folder as rootfolder
server.use(express.static('./dist'));
// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
  res.sendfile('index.html', { root: 'dist' });
});

// Dev task
gulp.task('dev', ['clean', 'views_jade', 'views_pug', 'copyfonts', 'copyhtml', 'styles', 'lint', 'browserify'], function() { });

// Clean task
gulp.task('clean', function() {
	//gulp.src('./dist/views', { read: false }) // much faster
  //.pipe(rimraf({force: true}));
});

// JSHint task
gulp.task('lint', function() {
  gulp.src('app/scripts/*.js')
//  .pipe(jshint())
//  .pipe(jshint.reporter('default'));
  .pipe(gulp.dest('dist/scripts/'));
});

// Styles task
gulp.task('styles', function() {
  gulp.src('app/styles/main.scss')
  //  .pipe(sourcemaps.init())
  // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
  // .pipe(sourcemaps.write('./maps'))
  // Optionally add autoprefixer
  .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
  // These last two should look familiar now :)
  .pipe(gulp.dest('dist/css/'));
});

// Browserify task
gulp.task('browserify', function() {
  // Single point of entry (make sure not to src ALL your files, browserify will figure it out)
  gulp.src(['app/scripts/main.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: false
  }))
  // Bundle to a single file
  .pipe(concat('bundle.js'))
  // Output it to our dist folder
  .pipe(gulp.dest('dist/js'));
});

// Views task
gulp.task('views_pug', function() {
 gulp.src('app/*.pug')
    .pipe( pug({ pretty: true }))
    .pipe( gulp.dest('dist/'))
});
// Views task
gulp.task('views_jade', function() {
 gulp.src('app/**/*.jade')
    .pipe( jade({ pretty: true }))
    .pipe( gulp.dest('dist/'))
});


gulp.task('copyhtml', function() {
 gulp.src('app/*.html')
    .pipe( gulp.dest('dist/'))
});


gulp.task('copyfonts', function() {
 gulp.src('app/fonts/*')
    .pipe( gulp.dest('dist/fonts/'))
});


// Compress and minify images to reduce their file size
gulp.task('images', function() {
    gulp.src('app/images/**/*')
    //.pipe(imagemin())
    .pipe(gulp.dest('dist/images/'))
    //.pipe(notify({ message: 'Images task complete' }));
});


var fontName = 'icons';
gulp.task('iconfont', function(){
  gulp.src(['app/assets/icons/*.svg'])
    .pipe(iconfontCss({
     fontName: fontName,
     path: 'app/styles/'+ fontName + '.css',
     targetPath: '../css/'+ fontName + '.css',
     fontPath: '../fonts/',
    }))
    .pipe(iconfont({
      fontName: fontName, // required 
      prependUnicode: true, // recommended option 
      formats: ['ttf', 'eot', 'woff'], // default, 'woff2' and 'svg' are available 
     }))
    .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('watch', ['lint'], function() {
  // Start webserver
  server.listen(serverport);
  // Start live reload
  refresh.listen(livereloadport);

  // Watch our scripts, and when they change run lint and browserify
  gulp.watch(['app/scripts/*.js', 'app/scripts/**/*.js'],[
    'lint',
    'browserify'
  ]);
  // Watch our sass files
  gulp.watch(['app/styles/**/*.scss'], [
    'styles'
  ]);

   gulp.watch(['app/fonts/**/*'], [
    'copyfonts'
  ]);

  gulp.watch(['app/**/*.pug'], [
    'views_pug'
  ]);
   gulp.watch(['app/**/*.jade'], [
    'views_jade'
  ]);

   gulp.watch(['app/**/*.html'], [
    'copyhtml'
  ]);
  gulp.watch(['app/assets/icons/*.svg'], [
    'iconfont'
  ]);

  

  // If an image is modified, run our images task to compress images
  gulp.watch('app/images/**/*', ['images']);

  gulp.watch('./dist/**').on('change', refresh.changed);

});

gulp.task('default', ['dev', 'watch']);
