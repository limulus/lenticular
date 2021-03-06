import * as lenticular from '../../'

export const command = 'generate'
export const desc = 'Generate artifacts — CloudFormation templates & Lambda zips'
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
    await generator.generateAndUploadArtifacts()
  }
}
