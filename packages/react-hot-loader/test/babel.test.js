/* eslint-env jest */

import path from 'path'
import fs from 'fs'
import { transformFileSync } from 'babel-core'
/* eslint-disable import/no-unresolved, import/extensions */
import { getOptions, TARGETS } from 'testConfig/babel'
/* eslint-enable import/no-unresolved, import/extensions */

const FIXTURES_DIR = path.join(__dirname, '__babel_fixtures__')

function trim(str) {
  return str.replace(/^\s+|\s+$/, '')
}

TARGETS.forEach(target => {
  describe(`Targetting "${target}"`, () => {
    describe('tags potential React components', () => {
      fs.readdirSync(FIXTURES_DIR).forEach(fixtureName => {
        const fixtureFile = path.join(FIXTURES_DIR, fixtureName)
        if (fs.statSync(fixtureFile).isFile()) {
          it(fixtureName.split('-').join(' '), () => {
            const actual = transformFileSync(fixtureFile, getOptions(target))
              .code
            const codeWithoutFilename = actual.replace(
              new RegExp(`["']${fixtureFile}["']`, 'g'),
              '__FILENAME__',
            )
            expect(trim(codeWithoutFilename)).toMatchSnapshot()
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
            const actual = transformFileSync(fixtureFile, getOptions(target))
              .code
            const codeWithoutFilename = actual.replace(
              new RegExp(`["']${fixtureFile}["']`, 'g'),
              '__FILENAME__',
            )
            expect(trim(codeWithoutFilename)).toMatchSnapshot()
          })
        }
      })
    })
  })
})
