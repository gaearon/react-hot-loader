import path from 'path';
import fs from 'fs';
import expect from 'expect';
import { transformFileSync } from 'babel-core';

function trim(str) {
  return str.replace(/^\s+|\s+$/, '');
}

describe('tags potential React components', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  fs.readdirSync(fixturesDir).map((caseName) => {
    it(caseName.split('-').join(' '), () => {
      const fixtureDir = path.join(fixturesDir, caseName);
      let actualPath = path.join(fixtureDir, 'actual.js');
      const actual = transformFileSync(actualPath).code;

      if (path.sep === '\\') {
        // Specific case of windows, transformFileSync return code with '/'
        actualPath = actualPath.replace(/\\/g, '/');
      }

      const expected = fs.readFileSync(
        path.join(fixtureDir, 'expected.js')
      ).toString().replace(/%FIXTURE_PATH%/g, actualPath);
      expect(trim(actual)).toEqual(trim(expected));
    });
  });
});
