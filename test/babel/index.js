import path from 'path';
import fs from 'fs';
import expect from 'expect';
import { transformFileSync } from 'babel-core';

function trim(str) {
  return str.replace(/^\s+|\s+$/, '');
}

describe('tags potential React components', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  fs.readdirSync(fixturesDir).map(fixtureName => {
    const fixtureDir = path.join(fixturesDir, fixtureName);
    if (!fs.statSync(fixtureDir).isDirectory()) {
      return;
    }
    it(fixtureName.split('-').join(' '), () => {
      const actualPath = path.join(fixtureDir, 'actual.js');
      const actual = transformFileSync(actualPath).code;
      const templatePath = path.sep === '\\' ?
        actualPath.replace(/\\/g, '/') :
        actualPath;
      const expected = fs.readFileSync(
        path.join(fixtureDir, 'expected.js')
      ).toString().replace('__FILENAME__', JSON.stringify(templatePath));
      expect(trim(actual)).toEqual(trim(expected));
    });
  });
});
