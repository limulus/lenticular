import assert from 'assert'
import AWS from 'aws-sdk'
import awsMocker from 'aws-sdk-mock'
import sinon from 'sinon'
import assertAsyncThrows from './util/assertAsyncThrows.js'

import SecretsManager from '../src/lib/SecretsManager.js'

function awsStub (service, method) {
  const stub = sinon.stub()
  awsMocker.mock(service, method, stub)
  return stub
}

describe(`SecretsManager`, () => {
  let manager
  const config = {
    secretsKeyId: 'deadbeef-cafefeed'
  }

  beforeEach(() => {
    manager = new SecretsManager(config)
  })

  afterEach(() => {
    awsMocker.restore()
  })

  describe(`saveSecret()`, () => {
    it(`should call ssm.putParameter()`, async () => {
      const stub = awsStub('SSM', 'putParameter').yieldsAsync(null, {})
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
      const stub = awsStub('SSM', 'getParameters')
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
      const stub = awsStub('SSM', 'getParameters')
        .yieldsAsync(null, { Parameters: [], InvalidParameters: ['foo'] })
      const err = await assertAsyncThrows(() => manager.getSecret('foo'))
      assert.strictEqual(err.message, `No such SSM parameter named "foo".`)
    })
  })

  describe(`deleteSecret()`, () => {
    it(`should call ssm.deleteParameter()`, async () => {
      const stub = awsStub('SSM', 'deleteParameter').yieldsAsync(null, {})
      await manager.deleteSecret('foo')
      sinon.assert.calledWith(stub, { Name: 'foo' })
    })
  })

  describe(`listSecrets()`, () => {
    it(`should call ssm.describeParameters()`, async () => {
      const stub = awsStub('SSM', 'describeParameters')
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
