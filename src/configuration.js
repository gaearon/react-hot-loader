const configuration = {
  // Log level
  logLevel: 'error',

  // Allows using SFC without changes
  pureSFC: true,

  // keep render method unpatched, moving sideEffect to componentDidUpdate
  pureRender: true,

  // Allows SFC to be used, enables "intermediate" components used by Relay, should be disabled for Preact
  allowSFC: true,

  // Allow reload of effect hooks with non zero dependency list
  reloadHooks: true,

  // Allow reload of mount effect hooks - zero deps
  reloadLifeCycleHooks: false,

  // Enables hook reload on hook body change
  reloadHooksOnBodyChange: true,

  // Disable "hot-replacement-render"
  disableHotRenderer: false,

  // @private
  integratedComparator: false,
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

  // flag to disable special treatment for React.lazy
  ignoreLazy: false,

  // ignoreSFC when injection into react-dom is made
  ignoreSFCWhenInjected: true,

  // flag to completely disable RHL for Components
  ignoreComponents: false,

  // default value for AppContainer errorOverlay
  errorReporter: undefined,

  // Global error overlay
  ErrorOverlay: undefined,

  // Actively track lazy loaded components
  trackTailUpdates: true,

  // react hot dom features enabled
  IS_REACT_MERGE_ENABLED: false,
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
