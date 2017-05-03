#!/usr/bin/env node

import yargs from 'yargs'
import rc from 'rc'
import {basename as pathBasename} from 'path'

yargs
  .commandDir('cmds')
  .demandCommand()
  .config(rc('lenticular'))
  .help()
  .argv
