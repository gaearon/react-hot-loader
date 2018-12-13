const configuration = {
  // Log level
  logLevel: 'error',

  // Allows using SFC without changes. leading to some components not updated
  pureSFC: false,

  // keep render method unpatched, moving sideEffect to componentDidUpdate
  pureRender: false,

  // Allows SFC to be used, enables "intermediate" components used by Relay, should be disabled for Preact
  allowSFC: true,

  // Disable "hot-replacement-render"
  disableHotRenderer: false,

  // Disable "hot-replacement-render" when injection into react-dom are made
  disableHotRendererWhenInjected: false,

  // Hook on babel component register.
  onComponentRegister: false,

  // Hook on React renders for a first time component
  onComponentCreate: false,

  // flag to completely disable RHL for SFC
  ignoreSFC: false,

  // flag to completely disable RHL for Components
  ignoreComponents: false,

  // default value for AppContainer errorOverlay
  errorReporter: undefined,

  // Global error overlay
  ErrorOverlay: undefined,
}

export const internalConfiguration = {
  // control proxy creation
  disableProxyCreation: false,
}

export default configuration
