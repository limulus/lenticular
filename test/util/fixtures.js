import {resolve as resolvePath} from 'path'
import {readFileSync} from 'fs'

export function loadFixtureAsString (fileName) {
  const path = resolvePath(__dirname, `..`, `..`, `fixtures`, fileName)
  return readFileSync(path, `utf8`)
}
