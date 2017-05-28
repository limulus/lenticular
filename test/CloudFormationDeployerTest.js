import assert from 'assert'
import sinon from 'sinon'
import * as aws from './util/aws-mock.js'

import CFDeployer from '../src/lib/CloudFormationDeployer.js'
import SecretsManager from '../src/lib/SecretsManager.js'

describe(`CloudFormationDeployer`, () => {
  let deployer
  const config = {
    productName: 'projectx',
    productDir: process.cwd(),
    secretsKeyId: 'deadbeef-cafefeed',
    buildRegion: 'us-west-2',
    gitHubOAuthTokenParameterName: '3lk3ljkasdlkjdfi3',
  }

  beforeEach(() => {
    deployer = new CFDeployer(config)
  })

  afterEach(() => {
    aws.restore()
  })

  describe(`deploy()`, () => {
    it(`should call createStack() when stack does not exist`, async () => {
      aws.stub('CloudFormation', 'describeStacks')
        .yieldsAsync(new Error(`Stack with id some-stack does not exist`))

      const mock = sinon.mock(deployer.cfEventMonitor)
        .expects('createStack').once()
        .resolves({ StackId: 'stack0' })

      await deployer.deploy('some-stack', `TemplateBody`)

      deployer.cfEventMonitor.createStack.restore()
      mock.verify()
    })

    it(`should call updateStack() when stack already exists`, async () => {
      aws.stub('CloudFormation', 'describeStacks').yieldsAsync(null, {})

      const mock = sinon.mock(deployer.cfEventMonitor)
        .expects('updateStack').once()
        .resolves({ StackId: 'stack0' })

      await deployer.deploy('some-stack', `TemplateBody`)

      deployer.cfEventMonitor.updateStack.restore()
      mock.verify()
    })

    it(`should call SecretsManager.get() to retreive secret params`, async () => {
      aws.stub('CloudFormation', 'describeStacks').yieldsAsync(null, {})
      const stub = sinon.stub(deployer.cfEventMonitor, 'updateStack').resolves({})

      const mock = sinon.mock(deployer.secretsManager)
        .expects('getSecret').once().withExactArgs('supersecretparam')

      await deployer.deploy('some-stack', `TemplateBody`, { secretParameters: ['supersecretparam'] })

      stub.restore()
      mock.verify()
    })
  })
})
