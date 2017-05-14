import {readFile, writeFile} from 'fs'
import {resolve as resolvePath, parse as parsePath} from 'path'
import mkdirp from 'mkdirp'
import {convertLenticularYamlToCloudFormationYaml} from './LenticularYamlDoc.js'

export default class ArtifactGenerator {
  constructor (config) {
    this.config = config
  }

  async generatePipelineTemplate () {
    return this.generateCloudFormationTemplate(
      resolvePath(this.config.projectDir, 'infra', 'pipeline.yaml'),
      resolvePath(this.config.projectDir, 'artifacts', 'infra', 'pipeline.yaml')
    )
  }

  async generateCloudFormationTemplate (srcPath, destPath) {
    return new Promise((resolve, reject) => {
      readFile(srcPath, 'utf8', (err, inYaml) => {
        if (err) return reject(err)
        const outYaml = convertLenticularYamlToCloudFormationYaml(inYaml, this.config)
        mkdirp(parsePath(destPath).dir, err => {
          if (err) return reject(err)
          writeFile(destPath, outYaml, err => {
            if (err) return reject(err)
            return resolve()
          })
        })
      })
    })
  }
}
