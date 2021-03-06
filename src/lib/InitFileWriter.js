import Configurable from './Configurable.js'
import {readFile, writeFile} from 'fs'
import {resolve as resolvePath, parse as parsePath} from 'path'
import template from 'backtick-template'
import mkdirp from 'mkdirp'

export default class InitFileWriter extends Configurable {
  constructor (config) {
    super(config, {
      extraRequiredProperties: ['productDir']
    })
    this.initTemplatesDir = resolvePath(__dirname, '..', '..', 'init-templates')
  }

  writeAll () {
    return Promise.all([
      this.writeRC(),
      this.writeBuildSpec(),
      this.writeBuildPipelineYaml(),
    ])
  }

  writeRC () {
    return this.applyConfigToTemplateAndWrite(
      resolvePath(this.initTemplatesDir, 'lenticularrc.json'),
      resolvePath(this.config.productDir, '.lenticularrc')
    )
  }

  writeBuildSpec () {
    return this.applyConfigToTemplateAndWrite(
      resolvePath(this.initTemplatesDir, 'buildspec.yml'),
      resolvePath(this.config.productDir, 'buildspec.yml')
    )
  }

  writeBuildPipelineYaml () {
    return this.applyConfigToTemplateAndWrite(
      resolvePath(this.initTemplatesDir, 'pipeline.yaml'),
      resolvePath(this.config.productDir, 'infra', 'pipeline.yaml')
    )
  }

  applyConfigToTemplateAndWrite (templatePath, outfilePath) {
    return new Promise((resolve, reject) => {
      readFile(templatePath, 'utf-8', (err, templateString) => {
        if (err) return reject(err)
        mkdirp(parsePath(outfilePath).dir, err => {
          if (err) return reject(err)
          const outData = template(templateString.replace(/\$\${/g, '%%%%%%{'), this.config)
            .replace(/%%%%%%{/g, '${')
          writeFile(outfilePath, outData, {flag: 'wx'}, (err) => {
            if (err) return reject(err)
            return resolve()
          })
        })
      })
    })
  }
}
