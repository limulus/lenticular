import * as lenticular from '../../'
import AWS from 'aws-sdk'

export const command = 'deploy-pipeline'
export const desc = 'Deploy changes to infra/pipeline.yaml'
export const builder = {}

export async function handler (argv) {
  AWS.config.update({'region': argv.buildRegion})
  const deployer = new lenticular.CloudFormationDeployer(argv)
  await deployer.deployPipeline()
}
