'use strict'

const fs = require('fs')
const path = require('path')
const { SourceNode, SourceMapConsumer } = require('source-map')
const { SourceMapGenerator } = require('source-map')

function transform(source, map) {
  if (source.indexOf('React.createElement') >= 0) {
    const separator = '\n\n;'
    const appendText = `  
    /** @jsx _J$X_ */           
    var __react_jsx__ = require('react');
    var _J$X_ = (__react_jsx__.default || __react_jsx__).createElement;
  `

    return this.callback(
      null,
      [appendText, source.replace(/React\.createElement\(/g, '_J$X_(')].join(
        separator,
      ),
    )
  }

  if (source.match(/import (.*) from ['"]react["']/)) {
    const separator = '\n\n;'
    const appendText = `  
    
    import * as TmpReact from 'react';
    const _J$X_ = TmpReact.createElement;
  `

    return this.callback(null, [appendText, source].join(separator))
  }

  return this.callback(null, source, map)
}

module.exports = transform
