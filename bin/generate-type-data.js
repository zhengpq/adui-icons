const fs = require('fs')
const path = require('path')
const outputPath = path.resolve(__dirname, '../src/data/icon-types/type-data.js')
const icons = require('../src/data')

const types = {
  导航: {
    description: '导航目录、指向、箭头类',
    data: [],
  },
  反馈: {
    description: '各类反馈状态的提示',
    data: [],
  },
  编辑: {
    description: '以动词、操作为导向',
    data: [],
  },
  工具: {
    description: '以名词、工具为导向',
    data: [],
  },
  图表: {
    description: '数据可视化方式、图表类型等',
    data: [],
  },
  生活: {
    description: '衣食住行、行业等',
    data: [],
  },
}

// 生成类型的数据
const generateTypeData = () => {
  for (const key in types) {
    for (const icon in icons) {
      if (icons[icon].category.includes(key)) {
        types[key].data.push({
          name: icon,
          keywords: icons[icon].description.split(',')
        })
      }
    }
  }
  const content = `export default ${JSON.stringify(types)}`
  fs.writeFileSync(outputPath, content, 'utf-8')
}

module.exports = generateTypeData
