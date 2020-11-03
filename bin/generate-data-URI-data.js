const fs = require('fs')
const path = require('path')
const sourceDir = path.resolve(__dirname, '../src/svg')
const outputPath = path.resolve(__dirname, '../src/data/data-URI/data-URI-data.js')
const defaultColor = 'black'

// svg 转化成 data-url
function svgToBg(fileContent) {
  const bg = fileContent.replace('<svg', (fileContent.indexOf('xmlns') ? '<svg' : '<svg xmlns="http://www.w3.org/2000/svg"'))
    .replace(/"/g, '\'')
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\s+/g, ' ')
  return bg
}

// 生成svgo处理过的数据
const generateDataURIData = () => {
  const data = {}
  fs.readdirSync(sourceDir).forEach(fileName => {
    if (fileName.includes('.svg')) {
      let fileContent = fs.readFileSync(`${sourceDir}/${fileName}`, 'utf-8')
      if (fileContent.includes('\n')) {
        fileContent = fileContent.replace(/\n/g, '')
      }
      fileContent = svgToBg(fileContent)
      data[fileName.split('.svg')[0]] = fileContent.split(defaultColor)
    }
  })
  const content = `export default ${JSON.stringify(data)}`
  fs.writeFileSync(outputPath, content, 'utf-8')
}

module.exports = generateDataURIData
