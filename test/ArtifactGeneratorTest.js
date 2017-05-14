import assert from 'assert'
import TmpDir from './util/TempDir.js'
import {getFixturePath, loadFixtureAsString} from './util/fixtures.js'
import {readFileSync} from 'fs'

import LenticularYamlDoc from '../src/lib/LenticularYamlDoc.js'
import ArtifactGenerator from '../src/lib/ArtifactGenerator.js'

describe(`ArtifactGenerator`, () => {
  const config = {
    productName: 'projectx',
    buildRegion: 'us-east-2',
    projectDir: null
  }

  let tmpDir
  beforeEach(async () => {
    tmpDir = await TmpDir.createWithPrefix(`lenticular-tests-`)
    config.projectDir = tmpDir.path
  })
  afterEach(() => tmpDir.clean())

  describe(`generateCloudFormationTemplate()`, () => {
    it(`should read src file and convert it`, async () => {
      const generator = new ArtifactGenerator(config)
      const src = getFixturePath('lenticular-cf.yaml')
      const dest = tmpDir.pathForFile('cf.yaml')
      await generator.generateCloudFormationTemplate(src, dest)
      const result = readFileSync(dest, 'utf8').replace(/\s+\r?\n/g, '\n')
      const expected = loadFixtureAsString('lenticular-cf-afterTransform.yaml')
      assert.strictEqual(result, expected)
    })
  })
})
