import * as lenticular from '../../../'

export const command = 'ls'
export const desc = 'List previously stored secret value names'
export const aliases = ['list']

export async function handler (argv) {
  lenticular.configureAWS(argv)
  const manager = new lenticular.SecretsManager(argv)
  const secrets = await manager.listSecrets()
  process.stdout.write(`${secrets.join('\n')}\n`)
}
