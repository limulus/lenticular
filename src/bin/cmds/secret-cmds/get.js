import * as lenticular from '../../../'

export const command = 'get <name>'
export const desc = 'Retrieve a previously stored secret value'

export async function handler (argv) {
  const manager = new lenticular.SecretsManager(argv)
  const value = await manager.getSecret(argv._[0])
  process.stdout.write(`${value}\n`)
}
