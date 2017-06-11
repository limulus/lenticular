import assert from 'assert'
import sinon from 'sinon'
import TmpDir from './util/TempDir.js'
import {sync as mkdirpSync} from 'mkdirp'
import {getFixturePath, loadFixtureAsString} from './util/fixtures.js'
import {readFileSync, writeFileSync} from 'fs'
import {resolve as resolvePath} from 'path'
import child_process from 'child_process'

import InitFileWriter from '../src/lib/InitFileWriter.js'
import ArtifactGenerator from '../src/lib/ArtifactGenerator.js'

describe(`ArtifactGenerator`, () => {
  const config = {
    productName: 'projectx',
    buildRegion: 'us-east-2',
    iamAdminUser: 'admin',
    githubRepoOwner: 'limulus',
    githubRepoName: 'projectx',
    githubRepoBranch: 'master',
    githubTokenSecret: 'github-limulus-token',
    secretsKeyId: 'jjk3-323434l32j3-3lkjlkj',
    githubWebhookSecret: 'projectx-github-webhook-secret',
    productDir: null
  }

  let generator, tmpDir
  beforeEach(async () => {
    tmpDir = await TmpDir.createWithPrefix(`lenticular-tests-`)
    config.productDir = tmpDir.path
    process.env.LAMBDA_BUCKET = `${config.productName}-${config.buildRegion}-lambdas`
    await (new InitFileWriter(config)).writeAll()
    generator = new ArtifactGenerator(config)
  })
  afterEach(async () => {
    delete process.env.LAMBDA_BUCKET
    await tmpDir.clean()
  })

  describe(`generateCloudFormationTemplate()`, () => {
    it(`should read src file and convert it`, async () => {
      const src = getFixturePath('lenticular-cf.yaml')
      const dest = tmpDir.pathForFile('cf.yaml')
      await generator.generateCloudFormationTemplate(src, dest)
      const result = readFileSync(dest, 'utf8').replace(/\s+\r?\n/g, '\n')
      const expected = loadFixtureAsString('lenticular-cf-afterTransform.yaml')
      assert.strictEqual(result, expected)
    })
  })

  describe(`generatePipelineTemplate()`, () => {
    it(`should call generateCloudFormationTemplate`, async () => {
      sinon.spy(generator, 'generateCloudFormationTemplate')
      await generator.generatePipelineTemplate()
      assert(generator.generateCloudFormationTemplate.calledWithExactly(
        resolvePath(config.productDir, 'infra', 'pipeline.yaml'),
        resolvePath(config.productDir, 'artifacts', 'infra', 'pipeline.yaml')
      ))
    })
  })

  describe(`generateLambdaArtifacts()`, () => {
    beforeEach(() => {
      const apiHandlerDir = tmpDir.pathForFile('lambdas/apiHandler')
      mkdirpSync(apiHandlerDir)
      writeFileSync(
        resolvePath(apiHandlerDir, 'index.js'),
        `module.exports.handler = () => {}`
      )
      writeFileSync(
        resolvePath(apiHandlerDir, 'package.json'),
        JSON.stringify({
          name: '@example/apiHandler',
          version: '0.0.1',
          main: 'index.js',
        }, undefined, 2)
      )
    })

    it('should run `aws cloudformation package`', async () => {
      const childProcessMock = sinon.mock(child_process)
      childProcessMock.expects('spawn')
        .once()
        .withArgs('aws', [
          'aws', 'cloudformation', 'package',
          '--template-file', tmpDir.pathForFile('artifacts/infrastructure.yaml'),
          '--s3-bucket', `${config.productName}-${config.buildRegion}-lambdas`,
          '--s3-prefix',
        ])

      await generator.generateLambdaArtifacts()
      mock.verify()
    })
  })
})
