#!/usr/bin/env node

import 'source-map-support/register'

import yargs from 'yargs'
import rc from 'rc'
import {basename as pathBasename} from 'path'

const config = rc('lenticular')

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
      default: config.buildRegion,
      group: 'Global Options:',
    },
    'product-dir': {
      desc: `Path to the product (project) directory`,
      default: process.cwd(),
      group: 'Global Options:',
    }
  })
  .group('help', 'Global Options:')
  .config(config)
  .help()
  .argv

process.on('unhandledRejection', err => {
  throw err
})
