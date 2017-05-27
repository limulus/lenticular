import * as lenticular from '../../..'
import inquirer from 'inquirer'

export const command = 'rm <name>'
export const desc = 'Delete a secret'

export async function handler (argv) {
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
