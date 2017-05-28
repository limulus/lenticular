import Configurable from './Configurable.js'
import AWS from 'aws-sdk'
import {inspect} from 'util'

export default class SecretsManager extends Configurable {
  constructor (config) {
    super(config, {
      extraRequiredProperties: ['buildRegion', 'secretsKeyId']
    })
  }

  async saveSecret (name, value) {
    await (new AWS.SSM()).putParameter({
      Name: name,
      Value: value,
      Type: 'SecureString',
      KeyId: this.config.secretsKeyId,
      Overwrite: true,
    }).promise()
  }

  async getSecret (name) {
    const response = await (new AWS.SSM())
      .getParameters({ Names: [name], WithDecryption: true })
      .promise()

    if (response.Parameters.length > 0) {
      return response.Parameters[0].Value
    }
    else if (response.Parameters.length === 0) {
      throw new Error(`No such SSM parameter named "${name}".`)
    }
    else {
      throw new Error(`Wha? Unexpected response from AWS: ${inspect(response)}`)
    }
  }

  async deleteSecret (name) {
    await (new AWS.SSM()).deleteParameter({
      Name: name
    }).promise()
  }

  async listSecrets () {
    let nextToken, secrets = []

    do {
      const request = Object.assign(
        nextToken ? { NextToken: nextToken} : {},
        { Filters: [{ Key: 'KeyId', Values: [this.config.secretsKeyId] }] }
      )

      const response = await (new AWS.SSM())
        .describeParameters(request).promise()

      secrets = secrets.concat(response.Parameters.map(p => p.Name))
      nextToken = response.NextToken
    } while (nextToken)

    return secrets
  }
}
