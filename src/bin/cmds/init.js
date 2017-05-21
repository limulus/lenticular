import {basename as pathBasename} from 'path'
import * as lenticular from '../../'

export const command = 'init'
export const desc = 'Write config and CloudFormation templates'
export const builder = {
  'product-dir': {
    desc: `Product directory in which to write files`,
    default: process.cwd(),
    group: 'Options:'
  },
}
export const implies = {
  'product-dir': 'product-name',
}

export async function handler (argv) {
  const writer = new lenticular.InitFileWriter(argv)
  await writer.writeAll()
  console.info(`
Wrote files to ${argv.productDir}.
Configuration saved to .lenticularrc.
Your directory for infrastructure templates is "infra".
Your directory for genrated artifacts is "artifacts". Add it to your .gitignore.
  `.trim())
}
