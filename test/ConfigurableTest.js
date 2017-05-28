import assert from 'assert'
import sinon from 'sinon'

import Configurable from '../src/lib/Configurable.js'

describe('Configurable', () => {
  const config = {
    productName: 'projectx',
    productDir: process.cwd(),
    buildRegion: 'us-west-2',
  }

  describe('config', () => {
    it(`should throw an error when missing required properites`, () => {
      const requiredProperties = `
        productName productDir buildRegion
      `.trim().split(/\s+/)

      requiredProperties.forEach(requiredProperty => {
        const configurable = new Configurable(config)
        const modedConfig = Object.assign({}, config)
        delete modedConfig[requiredProperty]
        assert.throws(
          () => { configurable.config = modedConfig },
          `Expected to throw when ${requiredProperty} is not present`
        )
      })
    })
  })
})
