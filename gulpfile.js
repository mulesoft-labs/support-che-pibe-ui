'use strict';

var gulp = require('gulp');  // Base gulp package
var babelify = require('babelify'); // Used to convert ES6 & JSX to ES5
var browserify = require('browserify'); // Providers "require" support, CommonJS
var notify = require('gulp-notify'); // Provides notification to both the console and Growel
var rename = require('gulp-rename'); // Rename sources
var sourcemaps = require('gulp-sourcemaps'); // Provide external sourcemap files
var livereload = require('gulp-livereload'); // Livereload support for the browser
var gutil = require('gulp-util'); // Provides gulp utilities, including logging and beep
var chalk = require('chalk'); // Allows for coloring for logging
var source = require('vinyl-source-stream'); // Vinyl stream support
var buffer = require('vinyl-buffer'); // Vinyl stream support
var watchify = require('watchify'); // Watchify for source changes
var merge = require('utils-merge'); // Object merge tool
var duration = require('gulp-duration'); // Time aspects of your gulp process
var cleanCSS     = require('gulp-clean-css');
var minify       = require('gulp-minify');
var clean = require('gulp-clean');
var browserSync  = require('browser-sync');
var reload       = browserSync.reload;
var uglify = require('gulp-uglify');
var envify = require('envify/custom');

// Configuration for Gulp
var config = {
  js: {
    src: './assets/js/main.jsx',
    watch: './assets/**/*',
    outputDir: './src/main/app/webapps/ui/js/',
    outputFile: 'build.js',
  },
};

// Error reporting function
function mapError(err) {
  if (err.fileName) {
    // Regular error
    gutil.log(chalk.red(err.name)
      + ': ' + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
      + ': ' + 'Line ' + chalk.magenta(err.lineNumber)
      + ' & ' + 'Column ' + chalk.magenta(err.columnNumber || err.column)
      + ': ' + chalk.blue(err.description));
  } else {
    // Browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message));
  }
}

// Completes the final file outputs
function bundle(bundler) {
  var bundleTimer = duration('Javascript bundle time');

  gulp
    .src(['assets/css/styles.css'])
    .pipe(gulp.dest('src/main/app/webapps/ui/css'));

  bundler
    .bundle()
    .on('error', mapError) // Map error reporting
    .pipe(source('main.jsx')) // Set source name
    .pipe(buffer()) // Convert to gulp pipeline
    .pipe(rename(config.js.outputFile)) // Rename the output file
    .pipe(sourcemaps.init({loadMaps: true})) // Extract the inline sourcemaps
    .pipe(sourcemaps.write('./map')) // Set folder for sourcemaps to output to
    .pipe(gulp.dest(config.js.outputDir)) // Set the output folder
    .pipe(notify({message: 'Generated file: <%= file.relative %>',})) // Output the file being created
    .pipe(bundleTimer) // Output time timing of the file creation
    .pipe(livereload()); // Reload the view in the browser
}


gulp.task('browsersync', function() {
  browserSync({
    port: 9000,
    server: {
      baseDir: './src/main/app/webapps/'
    },
    open: false,
    online: false,
    notify: false,
  });

  gulp.watch([
      'ui/*.html',
      'ui/js/**/*',
      'ui/css/*',
      'ui/images/*',
      'ui/images/**/*'
  ]).on('change', reload);
});

gulp.task('copy-css', function() {
  return gulp
    .src([
      'assets/css/styles.css'
    ])
    .pipe(gulp.dest('src/main/app/webapps/ui/css'))
    .pipe(notify({message: 'Generated file: <%= file.relative %>',}));
});

// Gulp task for build
gulp.task('watch', function() {
  livereload.listen();
  var args = merge(watchify.args, { debug: true }); // Merge in default watchify args with browserify arguments

  var bundler = browserify(config.js.src, args) // Browserify
    .plugin(watchify, {ignoreWatch: ['**/node_modules/**', '**/bower_components/**']}) // Watchify to watch source file changes
    .transform(babelify, {presets: ['es2015', 'react']})
    .transform(envify({
      _: 'purge',
      AUTH_BASEURI: 'http://support-che-pibe-api.cloudhub.io',
      API_BASEURI: 'http://support-che-pibe-api.cloudhub.io/api'
    }), {global: true});

  bundle(bundler); // Run the bundle the first time (required for Watchify to kick in)

  bundler.on('update', function() {
    bundle(bundler); // Re-run bundle on source updates
  });

  gulp.watch('assets/css/*.css', ['copy-css']);
});

gulp.task('apply-prod-environment', function() {
    process.env.NODE_ENV = 'production';
});

gulp.task('clean', function(){
  console.log('Clean');
  gulp.src('src/main/app/webapps/ui/css/*')
    .pipe(clean());
  gulp.src('src/main/app/webapps/ui/js/*')
    .pipe(clean());
});

gulp.task('compile-js', function(){
  console.log('Compile');
  var bundler = browserify(config.js.src)
    .transform(envify({
      _: 'purge',
      AUTH_BASEURI: 'http://support-che-pibe-api.cloudhub.io',
      API_BASEURI: 'http://support-che-pibe-api.cloudhub.io/api'
    }), {global: true})
    .transform(babelify, {presets: ['es2015', 'react']});

  return bundler.bundle()
    .on('error', mapError)
    .pipe(source('main.jsx'))
    .pipe(buffer())
    .pipe(rename(config.js.outputFile))
    .pipe(uglify())
    .pipe(gulp.dest(config.js.outputDir))

});

gulp.task('minimize-css', function(){
  console.log('Minimize CSS');
  gulp.src('assets/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('src/main/app/webapps/ui/css'));
});

gulp.task('minimize-js', function(){
  console.log('Minimize JS');
  gulp.src('src/main/app/webapps/ui/js/build.js')
    .pipe(minify({
        ext:{ src:'.js', min: '.js'},
        noSource: false,
        ignoreFiles: ['-min.js']
    }))
    .pipe(gulp.dest('src/main/app/webapps/ui/js'));
});

gulp.task('package', ['apply-prod-environment', 'clean','compile-js', 'minimize-css', 'minimize-js'], function(){
  console.log('Finish');
});

gulp.task('default', ['watch', 'browsersync']);
