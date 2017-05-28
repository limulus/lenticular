import isobject from 'isobject'
import uniq from 'lodash.uniq'

const config = Symbol('config')
const requiredProperties = Symbol('requiredProperties')

const baseRequiredProperties = ['productName']

export default class Configurable {
  constructor (theConfig, options={}) {
    if (! theConfig) {
      throw new Error(`Expected config object not passed to constructor`)
    }
    else if (! isobject(theConfig)) {
      throw new Error(`Expected plain object for config passed to constructor`)
    }

    this[requiredProperties] = uniq(
      baseRequiredProperties.concat(options.extraRequiredProperties || [])
    )

    this.config = theConfig
  }

  set config (theConfig) {
    this[requiredProperties].forEach(requiredProperty => {
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
