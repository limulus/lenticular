import AWS from 'aws-sdk'
import cfEventMonitor from 'aws-cf-monitor'
import SecretsManager from './SecretsManager.js'
import {convertLenticularYamlToCloudFormationYaml} from './LenticularYamlDoc.js'
import {readFile} from 'fs'

export default class CloudFormationDeployer {
  constructor (config) {
    this.config = config
    this.secretsManager = new SecretsManager(config)
    this.cfEventMonitor = cfEventMonitor
  }

  async deployPipeline () {
    const pipelineYaml = await readFileAsync('./infra/pipeline.yaml', 'utf8')
    const cfYaml = convertLenticularYamlToCloudFormationYaml(pipelineYaml, this.config)
    const opts = {
      secretParameters: {
        GitHubOAuthToken: this.config.gitHubOAuthTokenParameterName
      }
    }
    return this.deploy(`${this.config.productName}-pipeline`, cfYaml, opts)
  }

  async deploy (StackName, TemplateBody, opts={}) {
    const cf = new AWS.CloudFormation({region: this.config.buildRegion})

    let updateStack = this.cfEventMonitor.updateStack
    try {
      await cf.describeStacks({ StackName }).promise()
    }
    catch (err) {
      if (err.message.match(/does not exist/)) {
        updateStack = this.cfEventMonitor.createStack
      }
      else {
        throw err
      }
    }

    const params = Object.assign({}, opts.parameters || {})
    if (opts.secretParameters) {
      await Promise.all(Object.keys(opts.secretParameters).map(async (param) => {
        params[param] = await this.secretsManager.getSecret(opts.secretParameters[param])
      }))
    }

    const Parameters = Object.keys(params).map(key => {
      return { ParameterKey: key, ParameterValue: params[key] }
    })

    await updateStack({
      StackName,
      TemplateBody,
      Parameters,
      Capabilities: ['CAPABILITY_IAM'],
    })
  }
}

async function readFileAsync (...args) {
  return new Promise((resolve, reject) => {
    readFile.apply(undefined, args.concat((err, val) => {
      if (err) return reject(err)
      return resolve(val)
    }))
  })
}
