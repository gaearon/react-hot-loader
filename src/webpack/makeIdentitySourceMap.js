'use strict';

const { SourceMapGenerator } = require('source-map');

function makeIdentitySourceMap(content, resourcePath) {
  const map = new SourceMapGenerator();
  map.setSourceContent(resourcePath, content);

  content.split('\n').forEach((line, index) => {
    map.addMapping({
      source: resourcePath,
      original: {
        line: index + 1,
        column: 0,
      },
      generated: {
        line: index + 1,
        column: 0,
      },
    });
  });

  return map.toJSON();
}

module.exports = makeIdentitySourceMap;
