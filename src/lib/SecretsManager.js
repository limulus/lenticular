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
}
