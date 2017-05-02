import yaml from 'js-yaml'
import {
  CLOUDFORMATION_SCHEMA,
  cloudformationTags as CFTags
} from 'cloudformation-js-yaml-schema'


export default class YamlDocument {
  constructor (documentString) {
    this.data = yaml.safeLoad(documentString, {schema: LENTICULAR_SCHEMA})
  }

  toCloudFormationYamlString () {
    const yamlData = yamlDataToCloudFormationYamlData(this.data)
    return yamlDataToString(yamlData, CLOUDFORMATION_SCHEMA)
  }

  toYamlString (schema = LENTICULAR_SCHEMA) {
    return yamlDataToString(this.data, LENTICULAR_SCHEMA)
  }
}


function yamlDataToString (data, schema) {
  return yaml.safeDump(data, {schema})
}


function yamlDataToCloudFormationYamlData (data) {
  if (data.constructor === Object) {
    const copy = {}
    Object.keys(data).forEach(key => {
      copy[key] = yamlDataToCloudFormationYamlData(data[key])
    })
    return copy
  }
  else if (Array.isArray(data)) {
    return data.map(val => yamlDataToCloudFormationYamlData(val))
  }
  else if (data instanceof ResourceName) {
    return data.toCloudFormationYamlData()
  }
  else {
    return data
  }
}


class ResourceName {
  constructor (name) { this.name = name }

  toCloudFormationYamlData () {
    return new (cfClasses.get('!Join:sequence'))(['-', [
      new (cfClasses.get('!Ref:scalar'))('AWS::StackName'), this.name
    ]])
  }
}

class ResourceNameWithRegion extends ResourceName {
  toCloudFormationYamlData () {
    return new (cfClasses.get('!Join:sequence'))(['-', [
      new (cfClasses.get('!Ref:scalar'))('AWS::StackName'),
      this.name,
      new (cfClasses.get('!Ref:scalar'))('AWS::Region')
    ]])
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


const cfClasses = new Map(
  CFTags.map(tag => [`${tag.tag}:${tag.kind}`, tag.construct])
)

const LENTICULAR_SCHEMA = yaml.Schema.create(CFTags.concat([
  ResourceNameYamlType, ResourceNameWithRegionYamlType
]))
