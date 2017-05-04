import {readFile, writeFile} from 'fs'
import {resolve as resolvePath} from 'path'
import template from 'backtick-template'

export default class InitFileWriter {
  constructor (config) {
    this.config = config
    this.initTemplatesDir = resolvePath(__dirname, '..', '..', 'init-templates')
  }

  writeAll () {
    return Promise.all([
      this.writeRC()
    ])
  }

  writeRC () {
    return this.applyConfigToTemplateAndWrite(
      resolvePath(this.initTemplatesDir, 'lenticularrc.json'),
      resolvePath(this.config.projectDir, '.lenticularrc')
    )
  }

  applyConfigToTemplateAndWrite (templatePath, outfilePath) {
    return new Promise((resolve, reject) => {
      readFile(templatePath, 'utf-8', (err, templateString) => {
        if (err) return reject(err)
        const outData = template(templateString, this.config)
        writeFile(outfilePath, outData, (err) => {
          if (err) return reject(err)
          return resolve()
        })
      })
    })
  }
}
