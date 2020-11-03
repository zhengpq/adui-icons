const fs = require('fs')
const path = require('path')
const sourceDir = path.resolve(__dirname, '../src/svg')
const outputPath = path.resolve(__dirname, '../src/data/path/path.ts')
const outputNamePath = path.resolve(__dirname, '../src/data/path/adui-icon-names.ts')
// const defaultColor = 'black'

const files = fs.readdirSync(sourceDir)

// 生成path数据
const generatePathData = (files) => {
  let result = []
  files.forEach(file => {
    let fileContent = fs.readFileSync(`${sourceDir}/${file}`, 'utf-8')
    if (fileContent.includes('\n')) {
      fileContent = fileContent.replace(/\n/g, '')
    }
    const paths = fileContent.match(/ d="[^"]+"/g) || []
    const pathStrings = paths.map(s => s.slice(3))
    result.push(`    '${file.split('.svg')[0]}': [${pathStrings.join(", ")}],`)
    const content = `
    export default {
      ${result.join('\n')}
    }`
    fs.writeFileSync(
      outputPath,
      content
    )
  })
  // Promise.all(
  //   res.map((icon) => {
  //     if (!icon) {
  //       console.log('pakizheng', icon)
  //       return
  //     } else {
  //        console.log('pakizheng', Object.keys(icon))
  //     }
  //     const key = Object.keys(icon)[0]
  //     const source = icon[key]
  //     let pathStrings
  //     svgo.optimize(source).then(({data}) => {
  //       return data.match(/ d="[^"]+"/g) || []
  //     }).then((paths) => {
  //       pathStrings = paths.map(s => s.slice(3))
  //       result.push(`    '${key}': [${pathStrings.join(", ")}],`)
  //     })
  //   })
  // ).then(() => {
  //   const outputPath = path.join(path.resolve(__dirname), './src/data/path/path-data.ts')
  //   const content = `
  //   export default {
  //     ${result.join('\n')}
  //   }`
  //   fs.writeFileSync(
  //     outputPath,
  //     content
  //   )
  // }).catch(err => {
  //   console.log('path1', err)
  // })
}

// 生成iconName数据
const exportIconConsts = (files) => {
  const names = files.map((icon) => {
    return `  "${icon.split('.svg')[0]}": string;`
  })
  const content = `
  export interface IIconNames {
    ${names.join('\n')}
  }`
  fs.writeFileSync(
    outputNamePath,
    content
  )
}

const generateAduiData = () => {
  exportIconConsts(files)
  generatePathData(files)
}

module.exports = generateAduiData
