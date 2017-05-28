import assert from 'assert'
import sinon from 'sinon'
import assertAsyncThrows from './util/assertAsyncThrows.js'
import * as aws from './util/aws-mock.js'

import SecretsManager from '../src/lib/SecretsManager.js'

describe(`SecretsManager`, () => {
  let manager
  const config = {
    secretsKeyId: 'deadbeef-cafefeed'
  }

  beforeEach(() => {
    manager = new SecretsManager(config)
  })

  afterEach(() => {
    aws.restore()
  })

  describe(`saveSecret()`, () => {
    it(`should call ssm.putParameter()`, async () => {
      const stub = aws.stub('SSM', 'putParameter').yieldsAsync(null, {})
      await manager.saveSecret('foo', 'bar')
      sinon.assert.calledWith(stub, {
        Name: 'foo',
        Value: 'bar',
        Type: 'SecureString',
        KeyId: config.secretsKeyId,
        Overwrite: true,
      })
    })
  })

  describe(`getSecret()`, () => {
    it(`should call ssm.getParameters()`, async () => {
      const stub = aws.stub('SSM', 'getParameters')
        .yieldsAsync(null, {
          Parameters: [{
            Name: 'foo',
            Value: 'bar',
            Type: 'SecureString',
          }]
        })
      const foo = await manager.getSecret('foo')
      assert.strictEqual(foo, 'bar')
      sinon.assert.calledWith(stub, {
        Names: ['foo'],
        WithDecryption: true
      })
    })

    it(`should throw error with nice message when parameter doesn't exist`, async () => {
      const stub = aws.stub('SSM', 'getParameters')
        .yieldsAsync(null, { Parameters: [], InvalidParameters: ['foo'] })
      const err = await assertAsyncThrows(() => manager.getSecret('foo'))
      assert.strictEqual(err.message, `No such SSM parameter named "foo".`)
    })
  })

  describe(`deleteSecret()`, () => {
    it(`should call ssm.deleteParameter()`, async () => {
      const stub = aws.stub('SSM', 'deleteParameter').yieldsAsync(null, {})
      await manager.deleteSecret('foo')
      sinon.assert.calledWith(stub, { Name: 'foo' })
    })
  })

  describe(`listSecrets()`, () => {
    it(`should call ssm.describeParameters()`, async () => {
      const stub = aws.stub('SSM', 'describeParameters')
        .onFirstCall().yieldsAsync(null, {
          Parameters: [{
            Name: 'foo1',
            Type: 'SecureString',
            KeyId: config.secretsKeyId,
          }],
          NextToken: 'paginationtoken',
        })
        .onSecondCall().yieldsAsync(null, {
          Parameters: [{
            Name: 'foo2',
            Type: 'SecureString',
            KeyId: config.secretsKeyId
          }],
          NextToken: ''
        })

      const secrets = await manager.listSecrets()

      sinon.assert.calledTwice(stub)
      sinon.assert.calledWith(stub, {
        Filters: [{ Key: 'KeyId', Values: [config.secretsKeyId]}]
      })
      sinon.assert.calledWith(stub, {
        Filters: [{ Key: 'KeyId', Values: [config.secretsKeyId]}],
        NextToken: 'paginationtoken'
      })

      assert.deepEqual(secrets, ['foo1', 'foo2'])
    })
  })
})
