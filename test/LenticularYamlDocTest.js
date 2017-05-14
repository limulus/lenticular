import assert from 'assert'
import sinon from 'sinon'
import {readFileSync} from 'fs'
import {resolve as resolvePath} from 'path'

import LenticularYamlDoc, {convertLenticularYamlToCloudFormationYaml}
  from '../src/lib/LenticularYamlDoc.js'

function fixture (fileName) {
  const path = resolvePath(__dirname, `..`, `fixtures`, fileName)
  return readFileSync(path, `utf8`)
}

const config = { productName: 'projectx' }

describe(`LenticularYamlDoc`, () => {
  let doc

  describe(`constructor()`, () => {
    it(`should throw if document is not YAML`, () => {
      assert.throws(() => {
        doc = new LenticularYamlDoc(`:`)
      })
    })

    it(`should not throw if document is YAML`, () => {
      doc = new LenticularYamlDoc(`Hello: 'World'`)
    })

    it(`should parse CloudFormation templates without error`, () => {
      doc = new LenticularYamlDoc(fixture(`standard-cf.yaml`))
    })
  })

  describe(`toYamlString()`, () => {
    it(`should return functionally equivalent YAML`, () => {
      doc = new LenticularYamlDoc(`Hello: 'World'`)
      assert.strictEqual(doc.toYamlString().trim(), `Hello: World`)
    })

    it(`should return functionally equivalent CloudFormation YAML`, () => {
      doc = new LenticularYamlDoc(fixture(`standard-cf.yaml`))
      assert.strictEqual(
        doc.toYamlString().trim().replace(/\s+\r?\n/g, '\n'),
        fixture(`standard-cf-afterParse.yaml`).trim()
      )
    })
  })

  describe(`toCloudFormationYamlString()`, () => {
    it(`should handle Lenticular function translations correctly`, () => {
      doc = new LenticularYamlDoc(fixture(`lenticular-cf.yaml`), config)
      assert.strictEqual(
        doc.toCloudFormationYamlString().trim().replace(/\s+\r?\n/g, '\n'),
        fixture(`lenticular-cf-afterTransform.yaml`).trim()
      )
    })
  })
})

describe(`convertLenticularYamlToCloudFormationYaml()`, () => {
  it(`should call toCloudFormationYamlString() on document object`, () => {
    const spy = sinon.spy(LenticularYamlDoc.prototype, 'toCloudFormationYamlString')
    convertLenticularYamlToCloudFormationYaml(`Hello: World`, config)
    assert(spy.calledOn(sinon.match.instanceOf(LenticularYamlDoc)))
    spy.restore()
  })
})
