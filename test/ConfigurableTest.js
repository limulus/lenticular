import assert from 'assert'
import sinon from 'sinon'

import Configurable from '../src/lib/Configurable.js'

describe('Configurable', () => {
  const config = { productName: 'projectx' }

  describe('config', () => {
    it(`should throw an error when missing productName property`, () => {
      const configurable = new Configurable(config)
      const modedConfig = Object.assign({}, config)
      delete modedConfig.productName
      assert.throws(
        () => { configurable.config = modedConfig },
        `Expected to throw when productName is not present`
      )
    })

    it(`should throw an error when missing an extraRequiredProperties property`, () => {
      class SubConfigurable extends Configurable {
        constructor (config) {
          super(config, { extraRequiredProperties: ['buildRegion'] })
        }
      }

      assert.throws(
        () => { new SubConfigurable(config) },
        `Expected error for missing buildRegion config property`
      )
    })
  })
})
