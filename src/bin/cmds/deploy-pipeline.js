import * as lenticular from '../../'

export const command = 'deploy-pipeline'
export const desc = 'Deploy changes to infra/pipeline.yaml'
export const builder = {}

export async function handler (argv) {
  lenticular.configureAWS(argv)
  const deployer = new lenticular.CloudFormationDeployer(argv)
  await deployer.deployPipeline()
}
