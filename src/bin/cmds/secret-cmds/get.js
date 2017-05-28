import * as lenticular from '../../../'

export const command = 'get <name>'
export const desc = 'Retrieve a previously stored secret value'

export async function handler (argv) {
  lenticular.configureAWS(argv)
  const manager = new lenticular.SecretsManager(argv)
  const value = await manager.getSecret(argv.name)
  process.stdout.write(`${value}\n`)
}
