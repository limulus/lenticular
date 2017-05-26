import assert from 'assert'
import {writeFileSync, readFileSync, statSync} from 'fs'
import {resolve} from 'path'
import TmpDir from './util/TempDir.js'

import InitFileWriter from '../src/lib/InitFileWriter.js'

describe(`InitFileWriter`, () => {
  const config = {
    productName: 'tycho',
    buildRegion: 'us-east-2',
    githubRepoOwner: 'limulus',
    githubRepoName: 'tycho',
    githubRepoBranch: 'master',
    productDir: null
  }

  let writer, tmpDir
  beforeEach(async () => {
    tmpDir = await TmpDir.createWithPrefix(`lenticular-tests-`)
    config.productDir = tmpDir.path
    writer = new InitFileWriter(config)
  })

  afterEach(() => tmpDir.clean())

  describe(`writeAll()`, () => {
    it(`should write the expected .lenticularrc file`, async () => {
      await writer.writeAll()
      const outfilePath = resolve(config.productDir, '.lenticularrc')
      assert.deepEqual(JSON.parse(readFileSync(outfilePath)), {
        "productName": 'tycho',
        "buildRegion": 'us-east-2',
        "githubRepoOwner": 'limulus',
        "githubRepoName": 'tycho',
        "githubRepoBranch": 'master',
        "secretsKeyId": null,
        "gitHubOAuthTokenParameterName": null,
      })
    })

    it(`should write the infra/pipeline.yaml file`, async () => {
      await writer.writeAll()
      const outfilePath = resolve(config.productDir, 'infra', 'pipeline.yaml')
      assert(statSync(outfilePath))
    })

    it(`should write the buildspec.yml file`, async () => {
      const outfilePath = resolve(config.productDir, 'buildspec.yml')
      await writer.writeAll()
      assert(statSync(outfilePath))
    })

    it(`should not overwite existing buildspec.yml file`, async () => {
      const outfilePath = resolve(config.productDir, 'buildspec.yml')
      writeFileSync(outfilePath, "foo")
      await assertAsyncThrows(() => writer.writeAll())
      const fileData = readFileSync(outfilePath, 'utf8')
      assert.strictEqual(fileData, "foo")
    })
  })
})

async function assertAsyncThrows (f) {
  try { await f() }
  catch (err) { return }
  throw new Error(`Expected function to throw an error`)
}
