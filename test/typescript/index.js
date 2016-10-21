import * as tt from 'typescript-definition-tester';

describe('TypeScript definitions', () => {
  it('should compile against definition files', function tsDefTest(done) {
    this.timeout(5000);
    tt.compileDirectory(
      `${__dirname}/fixtures`,
      fileName => fileName.match(/\.tsx?$/),
      { jsx: true, noImplicitAny: true },
      () => done()
    );
  });
});
