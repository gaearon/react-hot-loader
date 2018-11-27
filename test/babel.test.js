import path from 'path'
import fs from 'fs'
import { transformFileSync } from 'babel-core'
/* eslint-disable import/no-unresolved, import/extensions */
import { getOptions, TARGETS } from '../testConfig/babel'
import plugin from '../src/babel.dev'
/* eslint-enable import/no-unresolved, import/extensions */

const babelPlugin = path.resolve(__dirname, '../src/babel.dev')
const babelPluginProd = path.resolve(__dirname, '../src/babel.prod')

const FIXTURES_DIR = path.join(__dirname, '__babel_fixtures__')

function trim(str) {
  return str.replace(/^\s+|\s+$/, '')
}

function addRHLPlugin(babel, prod = false) {
  babel.plugins.push(prod ? babelPluginProd : babelPlugin)
  return babel
}

const getPackageAbsolutePathSpy = jest.spyOn(plugin, 'getPackageAbsolutePath')
getPackageAbsolutePathSpy.mockReturnValue('react-hot-loader')

afterAll(() => {
  getPackageAbsolutePathSpy.mockRestore()
})

describe('babel', () => {
  TARGETS.forEach(target => {
    describe(`Targetting "${target}"`, () => {
      describe('tags potential React components', () => {
        fs.readdirSync(FIXTURES_DIR).forEach(fixtureName => {
          const fixtureFile = path.join(FIXTURES_DIR, fixtureName)
          const isForProd = fixtureName.endsWith('.prod.js')
          if (fs.statSync(fixtureFile).isFile()) {
            it(fixtureName.split('-').join(' '), () => {
              const actual = transformFileSync(
                fixtureFile,
                addRHLPlugin(getOptions(target), isForProd),
              ).code
              const codeWithoutFilename = actual.replace(
                new RegExp(`["']${fixtureFile.replace(/\\/g, '/')}["']`, 'g'),
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
              const actual = transformFileSync(
                fixtureFile,
                addRHLPlugin(getOptions(target)),
              ).code
              const codeWithoutFilename = actual.replace(
                new RegExp(`["']${fixtureFile.replace(/\\/g, '/')}["']`, 'g'),
                '__FILENAME__',
              )
              expect(trim(codeWithoutFilename)).toMatchSnapshot()
            })
          }
        })
      })
    })
  })

  describe('babel helpers', () => {
    const { shouldIgnoreFile } = plugin
    it('should ignore react and hot-loader', () => {
      expect(shouldIgnoreFile('node_modules/react')).toBe(true)
      expect(shouldIgnoreFile('node_modules\\react')).toBe(true)
      expect(shouldIgnoreFile('node_modules/react/xyz')).toBe(true)

      expect(shouldIgnoreFile('node_modules/react-hot-loader')).toBe(true)
      expect(shouldIgnoreFile('node_modules/react-hot-loader/xyz')).toBe(true)
    })

    it('should pass all other files', () => {
      expect(shouldIgnoreFile('react')).toBe(false)
      expect(shouldIgnoreFile('node_modules/react-select')).toBe(false)
      expect(shouldIgnoreFile('node_modules\\react-select')).toBe(false)
      expect(shouldIgnoreFile('some_modules/react/xyz')).toBe(false)

      expect(shouldIgnoreFile('node_modules/react-cold-loader')).toBe(false)
      expect(shouldIgnoreFile('react-hot-loader.js')).toBe(false)
    })
  })
})
