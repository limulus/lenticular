import Configurable from './Configurable.js'
import {readFile, writeFile} from 'fs'
import {resolve as resolvePath, parse as parsePath} from 'path'
import mkdirp from 'mkdirp'
import {convertLenticularYamlToCloudFormationYaml} from './LenticularYamlDoc.js'
import child_process from 'child_process'

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
      const outYaml = convertLenticularYamlToCloudFormationYaml(srcPath, this.config)
      mkdirp(parsePath(destPath).dir, err => {
        if (err) return reject(err)
        writeFile(destPath, outYaml, err => {
          if (err) return reject(err)
          return resolve()
        })
      })
    })
  }

  async generateAndUploadArtifacts () {
    await this.generateCloudFormationTemplate(
      resolvePath(this.config.productDir, 'infra', 'index.yaml'),
      resolvePath(this.config.productDir, 'artifacts', 'index-cf.yaml')
    )
    await this.uploadLambdaArtifactsAndTweakSAMTemplate(
      resolvePath(this.config.productDir, 'artifacts', 'index-cf.yaml'),
      resolvePath(this.config.productDir, 'artifacts', 'infrastructure.yaml')
    )
  }

  async uploadLambdaArtifactsAndTweakSAMTemplate (srcPath, destPath) {
    return new Promise((resolve, reject) => {
      const spawn = this._spawnDepInjection || child_process.spawn
      spawn('aws', [
        'cloudformation', 'package',
        '--template-file', srcPath,
        '--s3-bucket', process.env.LAMBDA_BUCKET,
        '--kms-key-id', 'alias/aws/s3',
        '--output-template-file', destPath,
      ], {stdio: 'inherit'})
        .once('exit', code => {
          if (code === 0) {
            return resolve(undefined)
          }
          else {
            return reject(
              new Error(`aws cloudformation package exited with ${code}`)
            )
          }
        })
        .once('error', err => {
          return reject(err)
        })
    })
  }
}
