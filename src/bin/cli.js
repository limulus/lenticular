#!/usr/bin/env node

import yargs from 'yargs'
import rc from 'rc'
import {basename as pathBasename} from 'path'

yargs
  .commandDir('cmds')
  .demandCommand()
  .options({
    'product-name': {
      desc: 'Name of your product. Short and unique',
      default: pathBasename(process.cwd()),
      group: 'Global Options:',
    },
    'build-region': {
      desc: `Region for product's build pipeline`,
      default: 'us-west-2',
      group: 'Global Options:',
    },
  })
  .group('help', 'Global Options:')
  .config(rc('lenticular'))
  .help()
  .argv
