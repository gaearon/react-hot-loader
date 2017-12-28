declare module 'react-hot-loader' {
  import * as React from 'react'

  interface ErrorReporterProps {
    error: any
  }

  export interface AppContainerProps {
    children?: React.ReactElement<any>
    errorReporter?:
      | React.ComponentClass<ErrorReporterProps>
      | React.StatelessComponent<ErrorReporterProps>
  }

  export class AppContainer extends React.Component<
    AppContainerProps,
    React.ComponentState
  > {}

  /**
   * Marks module and a returns a HOC to mark a Component inside it as hot-exported
   * @param {NodeModuleObject} module ALWAYS should be just "module".
   * @return {function} "hot" HOC.
   *
   * @example marks current module as hot, and export MyComponent as HotExportedMyComponent
   * export default hot(module)(MyComponent)
   */
  export function hot(
    module: any,
  ): <T = React.ComponentType<any>>(Component: T) => T

  /**
   * Tests are types of two components equal
   * @param {Component} typeA
   * @param {Component} typeB
   * @return {boolean} are they equal
   *
   * @example test that some rendered component(ReactElement), has the same type as BaseComponent
   * areComponentEqual(RenderedComponent.type, BaseComponent)
   */
  export function areComponentsEqual<T>(
    typeA: React.ComponentType<T>,
    typeB: React.ComponentType<T>,
  ): boolean

  export interface Config {
    /**
     * Specify loglLevel, default to 'error', set it to false to disable logs.
     * Available levels: ['debug', 'log', 'warn', 'error']
     */
    logLevel?: string
  }
  /**
   * Confugures how React Hot Loader works
   * @param {Config} config
   */
  export function setConfig(config: Config): void
}
