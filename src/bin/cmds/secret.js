export const command = 'secret'
export const desc = 'Get/Set secret values'
export const builder = yargs => yargs
  .commandDir('secret-cmds')
  .demandCommand()
