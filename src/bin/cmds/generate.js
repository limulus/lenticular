import * as lenticular from '../../'
import sysexits from 'sysexits'

export const command = 'generate'
export const desc = 'Generate CloudFormation templates'
export const builder = {
  'pipeline-only': {
    desc: `Only generate the pipeline CloudFormation template`,
    boolean: true,
    default: false,
    group: 'Options:'
  }
}

export async function handler (argv) {
  const generator = new lenticular.ArtifactGenerator(argv)
  if (argv.pipelineOnly) {
    await generator.generatePipelineTemplate()
  }
  else {
    console.error(`Sorry, only pipeline template generation working so far.`)
    process.exit(sysexits.USAGE)
  }
}
