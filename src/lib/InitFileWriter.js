import {readFile, writeFile} from 'fs'
import {resolve as resolvePath} from 'path'
import template from 'backtick-template'

export default class InitFileWriter {
  constructor (config) {
    this.config = config
    this.initTemplatesDir = resolvePath(__dirname, '..', '..', 'init-templates')
    this.templates = {
      lenticularrc: {
        src:  resolvePath(this.initTemplatesDir, 'lenticularrc.json'),
        dest: resolvePath(this.config.projectDir, '.lenticularrc')
      }
    }
  }

  writeAll () {
    return Promise.all([
      this.writeRC()
    ])
  }

  writeRC () {
    return new Promise((resolve, reject) => {
      const rcTemplatePath = resolvePath(this.initTemplatesDir, 'lenticularrc.json')
      readFile(rcTemplatePath, 'utf-8', (err, jsonTemplate) => {
        if (err) return reject(err)
        const json = template(jsonTemplate, this.config)
        writeFile(resolvePath(this.config.projectDir, '.lenticularrc'), json, (err) => {
          if (err) return reject(err)
          return resolve()
        })
      })
    })
  }
}
