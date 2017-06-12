import Configurable from './Configurable.js'
import {readFile, writeFile} from 'fs'
import {resolve as resolvePath, parse as parsePath} from 'path'
import mkdirp from 'mkdirp'
import {convertLenticularYamlToCloudFormationYaml} from './LenticularYamlDoc.js'
import {spawn} from 'child_process'

export default class ArtifactGenerator extends Configurable {
  constructor (config) {
    super(config, {
      extraRequiredProperties: ['productDir']
    })

    this._spawnDepInjection = null
  }

  async generatePipelineTemplate () {
    return this.generateCloudFormationTemplate(
      resolvePath(this.config.productDir, 'infra', 'pipeline.yaml'),
      resolvePath(this.config.productDir, 'artifacts', 'infra', 'pipeline.yaml')
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

  async uploadLambdaArtifactsAndTweakSAMTemplate (srcPath, destPath) {
    return new Promise((resolve, reject) => {
      const spawn = this._spawnDepInjection || spawn
      spawn('aws', [
        'cloudformation', 'package',
        '--template-file', srcPath,
        '--s3-bucket', process.env.LAMBDA_BUCKET,
        '--kms-key-id', 'aws/s3',
        '--output-template-file', destPath,
      ], {stdio: 'inherit'})
        .once('exit', e => {
          if (e.code === 0) {
            return resolve(undefined)
          }
          else {
            return reject(
              new Error(`aws cloudformation package exited with ${e.code}`)
            )
          }
        })
        .once('error', err => {
          return reject(err)
        })
    })
  }
}
