import assert from 'assert'
import {tmpdir} from 'os'
import {mkdtemp, readFileSync, statSync} from 'fs'
import {resolve} from 'path'
import rimraf from 'rimraf'

import InitFileWriter from '../src/lib/InitFileWriter.js'

describe(`InitFileWriter`, () => {
  const config = {
    productName: 'tycho',
    buildRegion: 'us-east-2',
    projectDir: null
  }

  let writer
  beforeEach(done => {
    mkdtemp(resolve(tmpdir(), `lenticular-tests-`), (err, tmpdirPath) => {
      assert.ifError(err)
      config.projectDir = tmpdirPath
      writer = new InitFileWriter(config)
      return done()
    })
  })

  afterEach(done => rimraf(config.projectDir, done))

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
