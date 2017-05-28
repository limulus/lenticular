import isobject from 'isobject'

const config = Symbol('config')

const requiredProperties = `
  productName productDir buildRegion
`.trim().split(/\s+/)

export default class Configurable {
  constructor (theConfig) {
    if (! theConfig) {
      throw new Error(`Expected config object not passed to constructor`)
    }
    else if (! isobject(theConfig)) {
      throw new Error(`Expected plain object for config passed to constructor`)
    }

    this.config = theConfig
  }

  set config (theConfig) {
    requiredProperties.forEach(requiredProperty => {
      if (! theConfig.hasOwnProperty(requiredProperty)) {
        throw new Error(`Config missing required ${requiredProperty} property.`)
      }
    })
    this[config] = Object.assign({}, theConfig)
  }

  get config () {
    return Object.assign({}, this[config])
  }
}
