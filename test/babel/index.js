import path from 'path';
import fs from 'fs';
import expect from 'expect';
import { transformFileSync } from 'babel-core';

function trim(str) {
  return str.replace(/^\s+|\s+$/, '');
}

describe('tags potential React components', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  fs.readdirSync(fixturesDir).forEach(fixtureName => {
    if (fixtureName !== 'class-properties') {
      const fixtureDir = path.join(fixturesDir, fixtureName);
      if (fs.statSync(fixtureDir).isDirectory()) {
        it(fixtureName.split('-').join(' '), () => {
          const actualPath = path.join(fixtureDir, 'actual.js');
          const actual = transformFileSync(actualPath).code;
          const templatePath = path.sep === '\\' ?
            actualPath.replace(/\\/g, '/') :
            actualPath;
          const expected = fs.readFileSync(
            path.join(fixtureDir, 'expected.js')
          ).toString().replace(/__FILENAME__/g, JSON.stringify(templatePath));
          expect(trim(actual)).toEqual(trim(expected));
        });
      }
    }
  });
});

describe('copies arrow function body block onto hidden class methods', () => {
  const fixturesDir = path.join(__dirname, 'fixtures/class-properties');
  fs.readdirSync(fixturesDir).forEach(fixtureName => {
    const fixtureDir = path.join(fixturesDir, fixtureName);
    if (fs.statSync(fixtureDir).isDirectory()) {
      it(fixtureName.split('-').join(' '), () => {
        const actualPath = path.join(fixtureDir, 'actual.js');
        const actual = transformFileSync(actualPath).code;
        const templatePath = path.sep === '\\' ?
          actualPath.replace(/\\/g, '/') :
          actualPath;
        const expected = fs.readFileSync(
          path.join(fixtureDir, 'expected.js')
        ).toString().replace(/__FILENAME__/g, JSON.stringify(templatePath));
        expect(trim(actual)).toEqual(trim(expected));
      });
    }
  });
});
