import {basename as pathBasename} from 'path'
import {readFileSync} from 'fs'
import parseGitHubUrl from 'parse-github-repo-url'
import * as lenticular from '../../'

const pkgJson = JSON.parse(readFileSync('package.json', 'utf8'))
if (pkgJson.repository) {
  const repo = pkgJson.repository
  var [githubRepoOwner, githubRepoName] = parseGitHubUrl(repo.url || repo)
}

export const command = 'init'
export const desc = 'Write config and CloudFormation templates'
export const builder = {
  'product-dir': {
    desc: `Product directory in which to write files`,
    default: process.cwd(),
    group: 'Options:'
  },
  'github-repo-owner': {
    desc: `GitHub username that owns this repo`,
    default: githubRepoOwner,
    group: 'Options:'
  },
  'github-repo-name': {
    desc: `Name of GitHub repository for this product`,
    default: githubRepoName,
    group: 'Options:'
  },
  'github-repo-branch': {
    desc: `Name of branch build pipeline gets its code from`,
    default: 'master',
    group: 'Options:'
  }
}
export const implies = {
  'product-dir': 'product-name',
}

export async function handler (argv) {
  const writer = new lenticular.InitFileWriter(argv)
  await writer.writeAll()
  console.info(`
Wrote files to ${argv.productDir}.
Configuration saved to .lenticularrc.
Your directory for infrastructure templates is "infra".
Your directory for genrated artifacts is "artifacts". Add it to your .gitignore.
  `.trim())
}
