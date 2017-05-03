import {basename as pathBasename} from 'path'
import * as lenticular from '../../'

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
  },
  'project-dir': {
    desc: `Project directory in which to write files`,
    default: process.cwd()
  },
}
export const implies = {
  'project-dir': 'product-name',
}

export async function handler (argv) {
  const writer = new lenticular.InitFileWriter(argv)
  await writer.writeAll()
}
