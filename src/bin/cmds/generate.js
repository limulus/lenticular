import * as lenticular from '../../'

export const command = 'generate'
export const desc = 'Generate CloudFormation templates'
export const builder = {
  'artifact-dir': {
    desc: `Directory in which to write generated files`,
    default: 'artifacts',
    group: 'Options:'
  },
  'pipeline-only': {
    desc: `Only generate the pipeline CloudFormation template`,
    boolean: true,
    default: false,
    group: 'Options:'
  }
}

export async function handler (argv) {
  
}
