import yaml from 'js-yaml'
import {
  CLOUDFORMATION_SCHEMA,
  cloudformationTags as CFTags
} from 'cloudformation-js-yaml-schema'


export default class LenticularYamlDoc {
  constructor (documentString, config={}) {
    this.data = yaml.safeLoad(documentString, {schema: LENTICULAR_SCHEMA})
    this.config = config
  }

  toCloudFormationYamlString () {
    const yamlData = lenticularYamlDataToCloudFormationYamlData(this.data, this.config)
    return yamlDataToString(yamlData, CLOUDFORMATION_SCHEMA)
  }

  toYamlString (schema = LENTICULAR_SCHEMA) {
    return yamlDataToString(this.data, LENTICULAR_SCHEMA)
  }
}


function yamlDataToString (data, schema) {
  return yaml.safeDump(data, {schema})
}


function lenticularYamlDataToCloudFormationYamlData (data, config) {
  if (data.constructor === Object) {
    const copy = {}
    Object.keys(data).forEach(key => {
      copy[key] = lenticularYamlDataToCloudFormationYamlData(data[key], config)
    })
    return copy
  }
  else if (Array.isArray(data)) {
    return data.map(val => lenticularYamlDataToCloudFormationYamlData(val, config))
  }
  else if (data instanceof LenticularYamlType) {
    return data.toCloudFormationYamlData(config)
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

  toCloudFormationYamlData (config) {
    return new (cfClasses.get('!Join:sequence'))(['-', [
      new (cfClasses.get('!Ref:scalar'))('AWS::StackName'), this.name
    ]])
  }
}

class ResourceNameWithRegion extends ResourceName {
  toCloudFormationYamlData (config) {
    return new (cfClasses.get('!Join:sequence'))(['-', [
      new (cfClasses.get('!Ref:scalar'))('AWS::StackName'),
      this.name,
      new (cfClasses.get('!Ref:scalar'))('AWS::Region')
    ]])
  }
}

class ProductName extends LenticularYamlType {
  toCloudFormationYamlData (config) {
    return config.productName
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

const cfClasses = new Map(
  CFTags.map(tag => [`${tag.tag}:${tag.kind}`, tag.construct])
)

const LENTICULAR_SCHEMA = yaml.Schema.create(CFTags.concat([
  ResourceNameYamlType, ResourceNameWithRegionYamlType, ProductNameYamlType
]))
