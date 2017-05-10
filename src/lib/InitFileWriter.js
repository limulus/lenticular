import {readFile, writeFile} from 'fs'
import {resolve as resolvePath, parse as parsePath} from 'path'
import template from 'backtick-template'
import mkdirp from 'mkdirp'

export default class InitFileWriter {
  constructor (config) {
    this.config = config
    this.initTemplatesDir = resolvePath(__dirname, '..', '..', 'init-templates')
  }

  writeAll () {
    return Promise.all([
      this.writeRC(),
      this.writeBuildPipelineYaml(),
    ])
  }

  writeRC () {
    return this.applyConfigToTemplateAndWrite(
      resolvePath(this.initTemplatesDir, 'lenticularrc.json'),
      resolvePath(this.config.projectDir, '.lenticularrc')
    )
  }

  writeBuildPipelineYaml () {
    return this.applyConfigToTemplateAndWrite(
      resolvePath(this.initTemplatesDir, 'pipeline.yaml'),
      resolvePath(this.config.projectDir, 'infra', 'pipeline.yaml')
    )
  }

  applyConfigToTemplateAndWrite (templatePath, outfilePath) {
    return new Promise((resolve, reject) => {
      readFile(templatePath, 'utf-8', (err, templateString) => {
        if (err) return reject(err)
        mkdirp(parsePath(outfilePath).dir, err => {
          if (err) return reject(err)
          const outData = template(templateString, this.config)
          writeFile(outfilePath, outData, (err) => {
            if (err) return reject(err)
            return resolve()
          })
        })
      })
    })
  }
}
