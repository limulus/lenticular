import yaml from 'js-yaml'
import {CLOUDFORMATION_SCHEMA} from 'cloudformation-js-yaml-schema'

export default class YamlDocument {
  constructor (documentString) {
    this.data = yaml.safeLoad(documentString, {
      schema: CLOUDFORMATION_SCHEMA
    })
  }

  transformYaml () {
    return yaml.safeDump(this.data, {schema: CLOUDFORMATION_SCHEMA})
  }
}
