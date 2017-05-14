import {resolve as resolvePath} from 'path'
import {readFileSync} from 'fs'

export function loadFixtureAsString (fileName) {
  return readFileSync(getFixturePath(fileName), `utf8`)
}

export function getFixturePath (fileName) {
  return resolvePath(__dirname, `..`, `..`, `fixtures`, fileName)
}
