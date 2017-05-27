import AWS from 'aws-sdk'

export default class SecretsManager {
  constructor (config) {
    this.config = config
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
    return response.Parameters[0].Value
  }
}
