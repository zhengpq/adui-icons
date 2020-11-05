const got = require('got')
const { ensureDir, writeFile } = require('fs-extra')
const { join, resolve } = require('path')
const Figma = require('figma-js')
const PQueue = require('p-queue')
require('dotenv').config()
const { FIGMA_TOKEN, FIGMA_FILE_URL, ADUI_ID} = process.env
// const FIGMA_TOKEN = '137867-237b6948-8462-4510-be5b-bee09a85c7cc'
// const FIGMA_FILE_URL = 'https://www.figma.com/file/PFuQDWtYvTBqy4wSz7tzTB/AD-UI-%E8%AE%BE%E8%AE%A1%E8%AF%AD%E8%A8%80?node-id=40%3A5'

const options = {
  format: 'svg',
  outputDir: './src/',
  scale: '1',
}

// for(const arg of process.argv.slice(2)) {
//   const [param, value] = arg.split('=')
//   if(options[param]) {
//     options[param] = value
//   }
// }

if (!FIGMA_TOKEN) {
  throw Error('Cannot find FIGMA_TOKEN in process!')
}

const client = Figma.Client({
  personalAccessToken: FIGMA_TOKEN,
})

// Fail if there's no figma file key
let fileId = null
if (!fileId) {
  try {
    fileId = FIGMA_FILE_URL.match(/file\/([a-z0-9]+)\//i)[1]
  } catch (e) {
    throw Error('Cannot find FIGMA_FILE_URL key in process!')
  }
}

console.log(`Exporting ${FIGMA_FILE_URL} components`)
client
  .file(fileId, {ids: [ADUI_ID]})
  .then(({ data }) => {
    console.log('Processing response')
    console.log('pakizheng', data)
    const components = {}

    function check(c) {
      if (c.type === 'COMPONENT') {
        const { name, id } = c
        const { description = '', key } = data.components[c.id]
        const { width, height } = c.absoluteBoundingBox

        components[id] = {
          name,
          id,
          key,
          file: fileId,
          description,
          width,
          height,
        }
      } else if (c.children) {
        // eslint-disable-next-line github/array-foreach
        c.children.forEach(check)
      }
    }

    data.document.children.forEach(check)
    if (Object.values(components).length === 0) {
      throw Error('No components found!')
    }
    console.log(
      `${Object.values(components).length} components found in the figma file`
    )
    return components
  })
  .then((components) => {
    console.log('Getting export urls')
    return client
      .fileImages(fileId, {
        format: options.format,
        ids: Object.keys(components),
        scale: options.scale,
      })
      .then(({ data }) => {
        for (const id of Object.keys(data.images)) {
          components[id].image = data.images[id]
        }
        return components
      })
      .catch((err) => {
        console.log('paki 11', err)
      })
  })
  .then((components) => {
    const componentsNew = {}
    for (const key in components) {
      components[key].name.replace(/' '/g, '')
      const item = components[key]
      const nameNew = item.name
      const nameSpices = nameNew.split('/')
      item.name = nameSpices[nameSpices.length - 1]
      nameSpices.splice(nameSpices.length - 1, 1)
      item.category = nameSpices
      componentsNew[item.name] = {...item}
    }
    return ensureDir(join(options.outputDir))
      .then(() =>
        writeFile(
          resolve(options.outputDir, 'data.js'),
          `module.exports = ${JSON.stringify(componentsNew)}`,
          'utf-8'
        )
      )
      .then(() => components)
      .catch((err) => {
        console.log('paki 22', err)
      })
  })
  .then((components) => {
    // console.log('paki 33', components)
    const contentTypes = {
      svg: 'image/svg+xml',
      png: 'image/png',
      jpg: 'image/jpeg',
    }
    return queueTasks(
      Object.values(components).map((component) => () => {
        // console.log('paki 33 -1 ', component)
        return got
          .get(component.image, {
            headers: {
              'Content-Type': contentTypes[options.format],
            },
            encoding: options.format === 'svg' ? 'utf8' : null,
          })
          .then((response) => {
            return ensureDir(join(options.outputDir, options.format))
              .then(() => {
                const names = component.name.split('/')
                const componentName = names[names.length - 1].replace(' ', '')
                return writeFile(
                  join(
                    options.outputDir,
                    options.format,
                    `${componentName}.${options.format}`
                  ),
                  response.body.includes(`fill-opacity="0.58"`) ? response.body.replace(/fill-opacity="0\.58"/g, '') : response.body,
                  options.format === 'svg' ? 'utf8' : 'binary'
                )
              })
              .catch((err) => {
                console.log('paki 33 -5', err)
              })
          })
          .catch((err) => {
            console.log('paki 33 -3', err)
          })
      })
    )
  })
  .catch((error) => {
    throw Error(`Error fetching components from Figma: ${error}`)
  })

function queueTasks(tasks, options) {
  const queue = new PQueue(Object.assign({ concurrency: 3 }, options))
  for (const task of tasks) {
    queue.add(task)
  }
  queue.start()
  return queue.onIdle()
}
