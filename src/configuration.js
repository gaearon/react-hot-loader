const configuration = {
  // Log level
  logLevel: 'error',

  // Allows using SFC without changes
  pureSFC: true,

  // keep render method unpatched, moving sideEffect to componentDidUpdate
  pureRender: true,

  // Allows SFC to be used, enables "intermediate" components used by Relay, should be disabled for Preact
  allowSFC: true,

  // Allow hot reload of effect hooks
  reloadHooks: true,

  // Disable "hot-replacement-render"
  disableHotRenderer: false,

  // @private
  integratedResolver: false,

  // Disable "hot-replacement-render" when injection into react-dom is made
  disableHotRendererWhenInjected: true,

  // Controls `react-🔥-dom patch` notification
  showReactDomPatchNotification: true,

  // Hook on babel component register.
  onComponentRegister: false,

  // Hook on React renders for a first time component
  onComponentCreate: false,

  // flag to completely disable RHL for SFC. Probably don't use it without dom patch made.
  ignoreSFC: false,

  // ignoreSFC when injection into react-dom is made
  ignoreSFCWhenInjected: true,

  // flag to completely disable RHL for Components
  ignoreComponents: false,

  // default value for AppContainer errorOverlay
  errorReporter: undefined,

  // Global error overlay
  ErrorOverlay: undefined,
};

export const internalConfiguration = {
  // control proxy creation
  disableProxyCreation: false,
};

export const setConfiguration = config => {
  // not using Object.assing for IE11 compliance
  for (const i in config) {
    if (config.hasOwnProperty(i)) {
      configuration[i] = config[i];
    }
  }
};

export default configuration;
