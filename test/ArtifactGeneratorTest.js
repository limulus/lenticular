import assert from 'assert'
import sinon from 'sinon'
import TmpDir from './util/TempDir.js'
import {getFixturePath, loadFixtureAsString} from './util/fixtures.js'
import {readFileSync} from 'fs'
import {resolve as resolvePath} from 'path'

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
    productDir: null
  }

  let generator, tmpDir
  beforeEach(async () => {
    tmpDir = await TmpDir.createWithPrefix(`lenticular-tests-`)
    config.productDir = tmpDir.path
    await (new InitFileWriter(config)).writeAll()
    generator = new ArtifactGenerator(config)
  })
  afterEach(() => tmpDir.clean())

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
})
