const gulp = require('gulp')
const babel = require('gulp-babel')
var minify = require('gulp-minify')

gulp.task('default', ['compile', 'compress'], () => {
  return true
})

gulp.task('compile', () => {
  return gulp.src('src/mole-fetch.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('compress', () => {
  return gulp.src('src/mole-fetch.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(minify({
      ext: {
        src: '.js',
        min: '.min.js'
      }
    }))
    .pipe(gulp.dest('dist'))
})
