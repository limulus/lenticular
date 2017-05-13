import {basename as pathBasename} from 'path'
import * as lenticular from '../../'

export const command = 'init'
export const desc = 'Write config and CloudFormation templates'
export const builder = {
  'project-dir': {
    desc: `Project directory in which to write files`,
    default: process.cwd(),
    group: 'Options:'
  },
}
export const implies = {
  'project-dir': 'product-name',
}

export async function handler (argv) {
  const writer = new lenticular.InitFileWriter(argv)
  await writer.writeAll()
}
