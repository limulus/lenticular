import Configurable from './Configurable.js'
import yaml from 'js-yaml'
import {readFileSync} from 'fs'
import {dirname, resolve} from 'path'
import {
  CLOUDFORMATION_SCHEMA,
  cloudformationTags as CFTags
} from 'cloudformation-js-yaml-schema'

export function convertLenticularYamlToCloudFormationYaml (documentString, config) {
  const doc = new LenticularYamlDoc(documentString, config)
  return doc.toCloudFormationYamlString()
}

export default class LenticularYamlDoc extends Configurable {
  constructor (documentString, config) {
    super(config)

    if (documentString.match(/^\//)) {
      this.path = documentString
      documentString = readFileSync(documentString)
    }

    this.data = yaml.safeLoad(documentString, {schema: LENTICULAR_SCHEMA})
  }

  toCloudFormationYamlString () {
    return yamlDataToString(
      this.toCloudFormationYamlData(), CLOUDFORMATION_SCHEMA
    )
  }

  toCloudFormationYamlData () {
    const context = {config: this.config, path: this.path}
    return lenticularYamlDataToCloudFormationYamlData(this.data, context)
  }

  toYamlString (schema = LENTICULAR_SCHEMA) {
    return yamlDataToString(this.data, LENTICULAR_SCHEMA)
  }
}


function yamlDataToString (data, schema) {
  return yaml.safeDump(data, {schema})
}


function lenticularYamlDataToCloudFormationYamlData (data, context) {
  const {config} = context

  if (data !== null && data.constructor === Object) {
    const copy = {}
    Object.keys(data).forEach(key => {
      copy[key] = lenticularYamlDataToCloudFormationYamlData(data[key], context)
    })
    return copy
  }
  else if (Array.isArray(data)) {
    return data.map(val => lenticularYamlDataToCloudFormationYamlData(val, context))
  }
  else if (data instanceof LenticularYamlType) {
    return data.toCloudFormationYamlData(context)
  }
  else if (instanceOfCFClass(data)) {
    const convertedData = lenticularYamlDataToCloudFormationYamlData(data.data, context)
    return new data.constructor(convertedData)
  }
  else {
    return data
  }
}

class LenticularYamlType {}

class ResourceName extends LenticularYamlType {
  constructor (name) {
    super()
    this.name = name
  }

  toCloudFormationYamlData () {
    return new (cfConstructors.get('!Join:sequence'))(['-', [
      new (cfConstructors.get('!Ref:scalar'))('AWS::StackName'), this.name
    ]])
  }
}

class ResourceNameWithRegion extends ResourceName {
  toCloudFormationYamlData () {
    return new (cfConstructors.get('!Join:sequence'))(['-', [
      new (cfConstructors.get('!Ref:scalar'))('AWS::StackName'),
      this.name,
      new (cfConstructors.get('!Ref:scalar'))('AWS::Region')
    ]])
  }
}

class ProductName extends LenticularYamlType {
  toCloudFormationYamlData ({config}) {
    return config.productName
  }
}

class ConfigValue extends LenticularYamlType {
  constructor (key) {
    super()
    this.key = key
  }

  toCloudFormationYamlData ({config}) {
    if (config[this.key] === undefined) {
      throw new Error(`Expected ${this.key} to be present in config object`)
    }
    return config[this.key] + ''
  }
}

class Require extends LenticularYamlType {
  constructor (jsFileRelativePath) {
    super()
    this.jsFileRelativePath = jsFileRelativePath
  }

  toCloudFormationYamlData ({path}) {
    if (!path) {
      throw new Error(`Lenticular yaml document must be loaded from a path when using Require`)
    }
    return require(resolve(dirname(path), this.jsFileRelativePath))()
  }
}


const ResourceNameYamlType = new yaml.Type('!Lenticular::ResourceName', {
  kind: 'scalar',
  instanceOf: ResourceName,
  construct: data => new ResourceName(data),
  represent: (ref, style) => ref.name
})

const ResourceNameWithRegionYamlType = new yaml.Type('!Lenticular::ResourceNameWithRegion', {
  kind: 'scalar',
  instanceOf: ResourceNameWithRegion,
  construct: data => new ResourceNameWithRegion(data),
  represent: (ref, style) => ref.name
})

const ProductNameYamlType = new yaml.Type('!Lenticular::ProductName', {
  kind: 'scalar',
  instanceOf: ProductName,
  construct: data => new ProductName(),
  represent: (ref, style) => ref.name
})

const ConfigValueYamlType = new yaml.Type('!Lenticular::ConfigValue', {
  kind: 'scalar',
  instanceOf: ConfigValue,
  construct: data => new ConfigValue(data),
  represent: (ref, style) => ref.name
})

const RequireYamlType = new yaml.Type('!Lenticular::Require', {
  kind: 'scalar',
  instanceOf: Require,
  construct: data => new Require(data),
  represent: (ref, style) => ref.name
})

const cfConstructors = new Map(
  CFTags.map(tag => [`${tag.tag}:${tag.kind}`, tag.construct])
)

const cfClasses = new Map(
  CFTags.map(tag => [`${tag.tag}:${tag.kind}`, tag.instanceOf])
)

function instanceOfCFClass (instance) {
  for (let cfClass of cfClasses.values()) {
    if (instance instanceof cfClass) {
      return true
    }
  }
  return false
}

export const LENTICULAR_SCHEMA = yaml.Schema.create(CFTags.concat([
  ResourceNameYamlType, ResourceNameWithRegionYamlType, ProductNameYamlType,
  ConfigValueYamlType, RequireYamlType
]))
