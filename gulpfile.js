const { src, dest, series, watch, parallel } = require('gulp')
const del = require('del')
const logger = require('gulp-logger')
const plumber = require('gulp-plumber')
const ts = require('gulp-typescript')
const babel = require('gulp-babel')

const generateSVGData = require('./bin/generate-svg-data')
const generateDataURIData = require('./bin/generate-data-URI-data')
const generateAduiData = require('./bin/generate-path-data')
const generateTypeData = require('./bin/generate-type-data')

// 生成svg数据包
console.log('pakizheng', generateSVGData)
generateSVGData()

// 生成path数据包
generateAduiData()

// 生成data URI数据包
generateDataURIData()

// 生成类型数据
generateTypeData()

// 在编译前清空 dist 文件夹
function clean() {
  return (async () => {
    await del('adui-icon')
  })()
}




// 编译包文件
function buildPackage() {
  return src(['package.json', 'README.md'])
    .pipe(logger({ showChange: true }))
    .pipe(plumber())
    .pipe(dest('adui-icon'))
}

// ts 文件直接导入
function buildTs() {
  return src(['src/**/**ts'], { base: 'src' })
    .pipe(logger({ showChange: true }))
    .pipe(plumber())
    .pipe(dest('adui-icon/lib'))
}

// // 编译ts文件
// function buildTs() {
//   return src(['src/data/**/**.ts'], { base: 'src' })
//     .pipe(plumber())
//     .pipe(
//       ts({
//         declaration: true,
//       })
//     )
//     .pipe(dest('adui-icon/src'))
// }

// 编译数据文件
function buildData() {
  return src(['src/data/**/**.js', 'index.js'], { base: 'src' })
    .pipe(logger({ showChange: true }))
    .pipe(plumber())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(dest('adui-icon/lib'))
}

// 监控代码的改动
function watchChange() {
  return watch('src', series(clean, buildData, buildTs, buildPackage))
}

exports.default = series(
  clean,
  parallel(buildData, buildTs, buildPackage),
  watchChange
)
exports.build = series(clean,parallel(buildData, buildTs, buildPackage))
