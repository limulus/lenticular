import * as lenticular from '../../..'
import inquirer from 'inquirer'

export const command = 'set <name>'
export const desc = 'Save a secret'
export const aliases = ['save', 'update', 'put']

export async function handler (argv) {
  lenticular.configureAWS(argv)
  const manager = new lenticular.SecretsManager(argv)
  const prompt = inquirer.createPromptModule()
  const answers = await prompt([{
    name: 'value',
    type: 'input',
    message: 'secret value:'
  }])
  await manager.saveSecret(argv.name, answers.value)
}
