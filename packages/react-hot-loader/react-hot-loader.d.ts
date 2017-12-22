declare module 'react-hot-loader' {
    import {ComponentClass, ComponentType, ReactChild} from "react";

    export class AppContainer extends ComponentClass<{ children: ReactChild }> {
    }

    /**
     * Marks module and a returns a HOC to mark a Component inside it as hot-exported
     * @param {NodeModuleObject} module ALWAYS should be just "module".
     * @return {function} "hot" HOC.
     *
     * @example marks current module as hot, and export MyComponent as HotExportedMyComponent
     * export default hot(module)(MyComponent)
     */
    export function hot(module: any): <T = ComponentType<any>>(Component: T) => T;

    /**
     * Tests are types of two components equal
     * @param {Component} typeA
     * @param {Component} typeB
     * @return {boolean} are they equal
     *
     * @example test that some rendered component(ReactElement), has the same type as BaseComponent
     * areComponentEqual(RenderedComponent.type, BaseComponent)
     */
    export function areComponentsEqual<T>(typeA: ComponentType<T>, typeB: ComponentType<T>): boolean;
}