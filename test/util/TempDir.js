import {tmpdir} from 'os'
import {mkdtemp} from 'fs'
import rimraf from 'rimraf'
import {resolve as resolvePath} from 'path'

export default class TempDir {
  constructor (path) {
    this.path = path
  }

  toString () {
    return this.path
  }

  static async createWithPrefix (prefix) {
    return new Promise((resolve, reject) => {
      mkdtemp(resolvePath(tmpdir(), prefix), (err, path) => {
        if (err) return reject(err)
        return resolve(new TempDir(path))
      })
    })
  }

  async clean () {
    return new Promise((resolve, reject) => {
      rimraf(this.path, err => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
}
