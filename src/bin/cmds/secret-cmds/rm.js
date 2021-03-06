import * as lenticular from '../../..'
import inquirer from 'inquirer'

export const command = 'rm <name>'
export const desc = 'Delete a secret'
export const aliases = ['delete', 'remove']

export async function handler (argv) {
  lenticular.configureAWS(argv)
  const manager = new lenticular.SecretsManager(argv)

  const prompt = inquirer.createPromptModule()
  const answers = await prompt([{
    name: 'continue',
    type: 'confirm',
    message: `Delete ${argv.name}?`,
    default: false,
  }])

  if (answers.continue) {
    await manager.deleteSecret(argv.name)
  }
}
