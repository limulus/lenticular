import {readFile, writeFile} from 'fs'
import {convertLenticularYamlToCloudFormationYaml} from './LenticularYamlDoc.js'

export default class ArtifactGenerator {
  constructor (config) {
    this.config = config
  }

  async generateCloudFormationTemplate (srcPath, destPath) {
    return new Promise((resolve, reject) => {
      readFile(srcPath, 'utf8', (err, inYaml) => {
        if (err) return reject(err)
        const outYaml = convertLenticularYamlToCloudFormationYaml(inYaml, this.config)
        writeFile(destPath, outYaml, err => {
          if (err) return reject(err)
          return resolve()
        })
      })
    })
  }
}
