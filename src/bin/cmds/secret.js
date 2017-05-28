export const command = 'secret'
export const desc = 'Get, set, list and delete secret values'
export const builder = yargs => yargs
  .commandDir('secret-cmds')
  .demandCommand()
