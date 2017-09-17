import path from 'path'
import fs from 'fs'
import { transformFileSync } from 'babel-core'

const FIXTURES_DIR = path.join(__dirname, '__babel_fixtures__')

function trim(str) {
  return str.replace(/^\s+|\s+$/, '')
}

describe('tags potential React components', () => {
  fs.readdirSync(FIXTURES_DIR).forEach(fixtureName => {
    const fixtureFile = path.join(FIXTURES_DIR, fixtureName)
    if (fs.statSync(fixtureFile).isFile()) {
      it(fixtureName.split('-').join(' '), () => {
        const actual = transformFileSync(fixtureFile).code
        expect(trim(actual)).toMatchSnapshot()
      })
    }
  })
})

describe('copies arrow function body block onto hidden class methods', () => {
  const fixturesDir = path.join(FIXTURES_DIR, 'class-properties')
  fs.readdirSync(fixturesDir).forEach(fixtureName => {
    const fixtureFile = path.join(fixturesDir, fixtureName)
    if (fs.statSync(fixtureFile).isFile()) {
      it(fixtureName.split('-').join(' '), () => {
        const actual = transformFileSync(fixtureFile).code
        expect(trim(actual)).toMatchSnapshot()
      })
    }
  })
})
