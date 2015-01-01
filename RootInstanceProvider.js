'use strict';

var DefaultRootInstanceProvider = require('./DefaultRootInstanceProvider');

var injectedProvider = null;

var RootInstanceProvider = {
  injection: {
    injectProvider: function (provider) {
      injectedProvider = provider;
    }
  },

  getRootInstances: function () {
    return injectedProvider.getRootInstances();
  }
};

RootInstanceProvider.injection.injectProvider(DefaultRootInstanceProvider);

module.exports = RootInstanceProvider;