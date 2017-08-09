#!/usr/bin/env node

import 'source-map-support/register'

import {config} from '..'
import yargs from 'yargs'
import {basename as pathBasename} from 'path'
import {readFileSync} from 'fs'
import parseGitHubUrl from 'parse-github-repo-url'

const pkgJson = JSON.parse(readFileSync('package.json', 'utf8'))
if (pkgJson.repository) {
  const repo = pkgJson.repository
  var [githubRepoOwner, githubRepoName] = parseGitHubUrl(repo.url || repo)
}

yargs
  .commandDir('cmds')
  .demandCommand()
  .options({
    'product-name': {
      desc: 'Name of your product. Short and unique',
      default: config.productName || pathBasename(process.cwd()),
      group: 'Global Options:',
    },
    'build-region': {
      desc: `Region for product's build pipeline`,
      demandOption: true,
      group: 'Global Options:',
    },
    'product-dir': {
      desc: `Path to the product (project) directory`,
      default: process.cwd(),
      group: 'Global Options:',
    },
    'github-repo-owner': {
      desc: `GitHub username that owns this repo`,
      default: githubRepoOwner,
      group: 'Global Options:'
    },
    'github-repo-name': {
      desc: `Name of GitHub repository for this product`,
      default: githubRepoName,
      group: 'Global Options:'
    },
    'github-repo-branch': {
      desc: `Name of branch build pipeline gets its code from`,
      default: 'master',
      group: 'Global Options:'
    },
    'github-token-secret': {
      desc: `Name of the secret that stores the GitHub Oauth token`,
      demandOption: true,
      group: 'Global Options:'
    },
    'secrets-key-id': {
      desc: `KMS Key ID used to encrypt secrets`,
      demandOption: true,
      group: 'Global Options:'
    },
    'iam-admin-user': {
      desc: `IAM user name that you use to deploy your pipeline`,
      demandOption: true,
      group: 'Global Options:'
    },
  })
  .group('help', 'Global Options:')
  .config(config)
  .help()
  .argv

process.on('unhandledRejection', err => {
  throw err
})
