import assert from 'assert'
import {readFileSync, statSync} from 'fs'
import {resolve} from 'path'
import TmpDir from './util/TempDir.js'

import InitFileWriter from '../src/lib/InitFileWriter.js'

describe(`InitFileWriter`, () => {
  const config = {
    productName: 'tycho',
    buildRegion: 'us-east-2',
    projectDir: null
  }

  let writer, tmpDir
  beforeEach(async () => {
    tmpDir = await TmpDir.createWithPrefix(`lenticular-tests-`)
    config.projectDir = tmpDir.path
    writer = new InitFileWriter(config)
  })

  afterEach(() => tmpDir.clean())

  describe(`writeAll()`, () => {
    it(`should write the expected .lenticularrc file`, async () => {
      await writer.writeAll()
      const outfilePath = resolve(config.projectDir, '.lenticularrc')
      assert.deepEqual(JSON.parse(readFileSync(outfilePath)), {
        "productName": 'tycho',
        "buildRegion": 'us-east-2'
      })
    })

    it(`should write the infra/pipeline.yaml file`, async () => {
      await writer.writeAll()
      const outfilePath = resolve(config.projectDir, 'infra', 'pipeline.yaml')
      assert(statSync(outfilePath))
    })
  })
})
