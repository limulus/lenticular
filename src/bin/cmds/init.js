import {basename as pathBasename} from 'path'
import * as Lenticular from '../../'

export const command = 'init'
export const desc = 'Write config and CloudFormation templates'
export const builder = {
  'product-name': {
    desc: 'Name of your product. Short and unique',
    default: pathBasename(process.cwd())
  },
  'build-region': {
    desc: `Region for product's build pipeline`,
    default: 'us-west-2'
  }
}

export function handler (argv) {
  console.log(argv)
}
