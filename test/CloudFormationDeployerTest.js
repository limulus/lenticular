import assert from 'assert'
import sinon from 'sinon'
import * as aws from './util/aws-mock.js'

import CFDeployer from '../src/lib/CloudFormationDeployer.js'
import SecretsManager from '../src/lib/SecretsManager.js'
import cfMonitor from 'aws-cf-monitor'

describe(`CloudFormationDeployer`, () => {
  let deployer
  const config = {
    productName: 'projectx',
    productDir: process.cwd(),
    secretsKeyId: 'deadbeef-cafefeed',
    buildRegion: 'us-west-2',
    githubTokenSecret: '3lk3ljkasdlkjdfi3',
  }

  const defaultDescribeStacksResult = {
    Stacks: [{
      Outputs: [
        { OutputKey: 'Foo', OutputValue: 'Bar', Description: 'Some Desc' }
      ]
    }]
  }

  beforeEach(() => {
    deployer = new CFDeployer(config)
  })

  afterEach(() => {
    aws.restore()
  })

  describe(`deploy()`, () => {
    it(`should call createOrUpdateStack()`, async () => {
      aws.stub('CloudFormation', 'describeStacks')
        .yieldsAsync(null, defaultDescribeStacksResult)

      const mock = sinon.mock(cfMonitor)
      mock.expects('createOrUpdateStack').once().resolves({ StackId: 'stack0' })

      await deployer.deploy('some-stack', `TemplateBody`)

      mock.verify()
    })

    it(`should call SecretsManager.get() to retreive secret params`, async () => {
      aws.stub('CloudFormation', 'describeStacks')
        .yieldsAsync(null, defaultDescribeStacksResult)
      const stub = sinon.stub(cfMonitor, 'createOrUpdateStack').resolves({})

      const mock = sinon.mock(deployer.secretsManager)
      mock.expects('getSecret').once().withExactArgs('supersecretparam')

      await deployer.deploy('some-stack', `TemplateBody`, { secretParameters: ['supersecretparam'] })

      stub.restore()
      mock.verify()
    })

    it(`should return outputs from stack`, async () => {
      const updateStackStub = sinon.stub(cfMonitor, 'createOrUpdateStack')
        .resolves({})
      const stub = aws.stub('CloudFormation', 'describeStacks')
        .yieldsAsync(null, defaultDescribeStacksResult)

      const outputs = await deployer.deploy('some-stack', `TemplateBody`)

      updateStackStub.restore()
      assert.deepEqual(outputs, {Foo: 'Bar'})
    })
  })
})
