import * as lenticular from '../../'

export const command = 'init'
export const desc = 'Write config and CloudFormation templates'
export const builder = {}

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
