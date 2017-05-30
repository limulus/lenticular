import AWS from 'aws-sdk'
import Configurable from './Configurable.js'
import SecretsManager from './SecretsManager.js'
import {convertLenticularYamlToCloudFormationYaml} from './LenticularYamlDoc.js'
import {readFile} from 'fs'
import cfMonitor from 'aws-cf-monitor'

export default class CloudFormationDeployer extends Configurable {
  constructor (config) {
    super(config, {
      extraRequiredProperties: [
        'buildRegion', 'githubTokenSecret', 'secretsKeyId'
      ],
    })

    this.secretsManager = new SecretsManager(config)
  }

  async deployPipeline () {
    const pipelineYaml = await readFileAsync('./infra/pipeline.yaml', 'utf8')
    const cfYaml = convertLenticularYamlToCloudFormationYaml(pipelineYaml, this.config)
    const opts = {
      secretParameters: {
        GitHubOAuthToken: this.config.githubTokenSecret
      }
    }
    return await this.deploy(`${this.config.productName}-pipeline`, cfYaml, opts)
  }

  async deploy (StackName, TemplateBody, opts={}) {
    const cf = new AWS.CloudFormation()

    let updateStack = cfMonitor.updateStack
    try {
      await cf.describeStacks({ StackName }).promise()
    }
    catch (err) {
      if (err.message.match(/does not exist/)) {
        updateStack = cfMonitor.createStack
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
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
    })

    const stackDesc = await cf.describeStacks({ StackName }).promise()
    const outputs = {}
    stackDesc.Stacks[0].Outputs.forEach(o => {
      outputs[o.OutputKey] = o.OutputValue
    })
    return outputs
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
