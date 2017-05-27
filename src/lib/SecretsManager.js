import AWS from 'aws-sdk'
import {inspect} from 'util'

export default class SecretsManager {
  constructor (config) {
    this.config = config
  }

  async saveSecret (name, value) {
    await (new AWS.SSM({region: this.config.buildRegion})).putParameter({
      Name: name,
      Value: value,
      Type: 'SecureString',
      KeyId: this.config.secretsKeyId,
      Overwrite: true,
    }).promise()
  }

  async getSecret (name) {
    const response = await (new AWS.SSM({region: this.config.buildRegion}))
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
    await (new AWS.SSM({region: this.config.buildRegion})).deleteParameter({
      Name: name
    }).promise()
  }
}
