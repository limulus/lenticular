import assert from 'assert'
import AWS from 'aws-sdk'
import awsMocker from 'aws-sdk-mock'
import sinon from 'sinon'

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
      const stub = awsStub('SSM', 'putParameter').yields(null, {})
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


  // AWS.mock('SSM', 'getParameters', (params, cb) => {
  //   return cb(null, {
  //     Parameters: params.map(p => {
  //       Name: p,
  //       Type: 'SecureString',
  //       Value: 'batteryhorsestaple'
  //     })
  //   })
  // })

})
