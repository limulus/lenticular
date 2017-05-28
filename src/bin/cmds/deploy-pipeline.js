import * as lenticular from '../../'

export const command = 'deploy-pipeline'
export const desc = 'Deploy changes to infra/pipeline.yaml'
export const builder = {}

export async function handler (argv) {
  lenticular.configureAWS(argv)
  const deployer = new lenticular.CloudFormationDeployer(argv)
  const outputs = await deployer.deployPipeline()

  if (Object.keys(outputs).length) {
    process.stdout.write(`Outputs from stack:\n`)
    Object.keys(outputs).forEach(o => {
      process.stdout.write(`  ${o}: ${outputs[o]}\n`)
    })
  }
}
