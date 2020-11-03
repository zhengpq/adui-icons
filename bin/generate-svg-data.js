const fs = require('fs')
const path = require('path')
const sourceDir = path.resolve(__dirname, '../src/svg')
const outputPath = path.resolve(__dirname, '../src/data/svg/svg-data.js')
const defaultColor = 'black'

const generateSVGData = () => {
  const data = {}
  fs.readdirSync(sourceDir).forEach(fileName => {
    if (fileName.includes('.svg')) {
      let fileContent = fs.readFileSync(`${sourceDir}/${fileName}`, 'utf-8')
      if (fileContent.includes('\n')) {
        fileContent = fileContent.replace(/\n/g, '')
      }
      data[fileName.split('.svg')[0]] = fileContent.split(defaultColor)
    }
  })
  const content = `export default ${JSON.stringify(data)}`
  fs.writeFileSync(outputPath, content, 'utf-8')
}

module.exports = generateSVGData
