import assert from 'assert'
import {readFileSync} from 'fs'
import {resolve as resolvePath} from 'path'

import YamlDocument from '../src/lib/YamlDocument.js'

function fixture (fileName) {
  const path = resolvePath(__dirname, `..`, `fixtures`, fileName)
  return readFileSync(path, `utf8`)
}

describe(`YamlDocument`, () => {
  let doc

  describe(`constructor()`, () => {
    it(`should throw if document is not YAML`, () => {
      assert.throws(() => {
        doc = new YamlDocument(`:`)
      })
    })

    it(`should not throw if document is YAML`, () => {
      doc = new YamlDocument(`Hello: 'World'`)
    })

    it(`should parse CloudFormation templates without error`, () => {
      doc = new YamlDocument(fixture(`standard-cf.yaml`))
    })
  })

  describe(`toYamlString()`, () => {
    it(`should return functionally equivalent YAML`, () => {
      doc = new YamlDocument(`Hello: 'World'`)
      assert.strictEqual(doc.toYamlString().trim(), `Hello: World`)
    })

    it(`should return functionally equivalent CloudFormation YAML`, () => {
      doc = new YamlDocument(fixture(`standard-cf.yaml`))
      assert.strictEqual(
        doc.toYamlString().trim().replace(/\s+\r?\n/g, '\n'),
        fixture(`standard-cf-afterParse.yaml`).trim()
      )
    })
  })

  describe(`toCloudFormationYamlString()`, () => {
    it(`should handle !Lenticular::ResourceName translation correctly`, () => {
      doc = new YamlDocument(fixture(`lenticular-cf.yaml`))
      assert.strictEqual(
        doc.toCloudFormationYamlString().trim().replace(/\s+\r?\n/g, '\n'),
        fixture(`lenticular-cf-afterTransform.yaml`).trim()
      )
    })
  })
})
