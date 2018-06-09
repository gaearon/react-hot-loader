/* eslint-env jest */
/* eslint-disable react/no-render-return-value */
import React from 'react'
import { createMounter, ensureNoWarnings } from './helper'
import createProxy from '../../src/proxy'
import configuration from '../../src/configuration'

const createFixtures = () => ({
  modern: {
    Bar: class Bar extends React.Component {
      componentWillUnmount() {
        this.didUnmount = true
      }

      doNothing() {}

      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }

      /* eslint-enable */

      render() {
        return <div>Bar</div>
      }
    },

    Baz: class Baz extends React.Component {
      componentWillUnmount() {
        this.didUnmount = true
      }

      thisIsES6 = () => {}

      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }

      /* eslint-enable */

      render() {
        return <div>Baz</div>
      }
    },

    Foo: class Foo extends React.Component {
      static displayName = 'Foo (Custom)'

      componentWillUnmount() {
        this.didUnmount = true
      }

      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }

      /* eslint-enable */

      render() {
        return <div>Foo</div>
      }
    },
  },
})

describe('consistency', () => {
  ensureNoWarnings()
  const { mount } = createMounter()

  Object.keys(createFixtures()).forEach(type => {
    describe(type, () => {
      let Bar
      let Baz
      let Foo

      beforeEach(() => {
        ;({ Bar, Baz, Foo } = createFixtures()[type])
      })

      it('overwrites the original class', () => {
        // spin up
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        const barWrapper = mount(<Proxy />)
        const barInstance = barWrapper.instance()
        expect(barWrapper.text()).toBe('Bar')

        // replace base component
        proxy.update(Baz)
        const realBarWrapper = mount(<Bar />)
        const realBarInstance = realBarWrapper.instance()

        // detecting babel envirorment
        const baz = new Baz()
        if (baz.thisIsES6.toString().indexOf('=>') >= 0) {
          // this is ES6 class. Bar is still Bar.
          expect(realBarWrapper.text()).toBe('Bar')
        } else {
          // this is ES5 class. Bar is now Baz!
          expect(realBarWrapper.text()).toBe('Baz')
        }

        expect(barInstance).not.toBe(realBarInstance)
        expect(barInstance.didUnmount).toBe(true)
      })

      it('returns an existing proxy when wrapped twice', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        const proxyTwice = createProxy(Proxy)
        expect(proxyTwice).toBe(proxy)
      })

      /*
       * https://github.com/reactjs/react-redux/issues/163#issuecomment-192556637
       */
      it('avoid false positives when statics are hoisted', () => {
        const fooProxy = createProxy(Foo)
        const FooProxy = fooProxy.get()

        class Stuff extends React.Component {
          render() {
            return null
          }
        }

        const KNOWN_STATICS = {
          name: true,
          length: true,
          prototype: true,
          caller: true,
          arguments: true,
          arity: true,
          type: true,
        }
        Object.getOwnPropertyNames(FooProxy).forEach(key => {
          if (!KNOWN_STATICS[key]) {
            Stuff[key] = FooProxy[key]
          }
        })

        const stuffProxy = createProxy(Stuff)
        expect(stuffProxy).not.toBe(fooProxy)
      })

      it('prevents recursive proxy cycle', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        proxy.update(Proxy)
        expect(proxy.get()).toBe(Proxy)
      })

      it('prevents double proxy creation', () => {
        const proxy1 = createProxy(Bar)
        const proxy2 = createProxy(Bar)
        expect(proxy1.get()).toBe(proxy2.get())
      })

      it('prevents mutually recursive proxy cycle', () => {
        const barProxy = createProxy(Bar)
        const BarProxy = barProxy.get()

        const fooProxy = createProxy(Foo)
        const FooProxy = fooProxy.get()

        barProxy.update(FooProxy)
        fooProxy.update(BarProxy)
      })

      it('sets up constructor to match the type', () => {
        const proxy = createProxy(Bar)
        const BarProxy = proxy.get()
        const barInstance = mount(<BarProxy />).instance()
        expect(barInstance.constructor).toBe(BarProxy)
        expect(barInstance instanceof BarProxy).toBe(true)

        proxy.update(Baz)
        const BazProxy = proxy.get()
        expect(BarProxy).toBe(BazProxy)
        expect(barInstance.constructor).toBe(BazProxy)
        expect(barInstance instanceof BazProxy).toBe(true)
      })

      it('replaces toString (if readable)', () => {
        const barProxy = createProxy(Bar, 'bar')
        const BarProxy = barProxy.get()
        expect(BarProxy.toString()).toMatch(/^(class|function) Bar/)

        Object.defineProperty(Foo, 'toString', {
          configurable: false,
          value: Foo.toString,
          writable: false,
        })
        createProxy(Foo, 'foo')
      })

      it('sets up displayName from displayName or name', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        const barInstance = mount(<Proxy />).instance()
        expect(barInstance.constructor.displayName).toBe('Bar')

        proxy.update(Baz)
        expect(barInstance.constructor.displayName).toBe('Baz')

        proxy.update(Foo)
        expect(barInstance.constructor.displayName).toBe('Foo (Custom)')
      })

      it('inherits from base', () => {
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()

        expect(Proxy.prototype instanceof Bar).toBe(true)
      })

      it('should transparently pass arguments to the render function', () => {
        const spy = jest.fn()

        class Foo extends React.Component {
          render(...args) {
            spy(...args)
            return null
          }
        }

        const proxy = createProxy(Foo)
        const Proxy = proxy.get()
        const instance = new Proxy()
        const props = {}
        const state = {}
        instance.render(props, state)
        expect(spy).toHaveBeenCalledWith(props, state)
        instance.render(1, 2)
        expect(spy).toHaveBeenCalledWith(1, 2)
        instance.render(0)
        expect(spy).toHaveBeenCalledWith(0)
      })

      it('should revert arrow member change', () => {
        /* eslint-disable */
        class BaseClass extends React.Component {
          arrow = () => 42

          render() {
            return this.arrow()
          }

          __reactstandin__regenerateByEval(key, code) {
            this[key] = eval(code)
          }
        }

        class Update1Class extends React.Component {
          arrow = () => 43

          render() {
            return this.arrow()
          }

          __reactstandin__regenerateByEval(key, code) {
            this[key] = eval(code)
          }
        }

        class Update2Class extends React.Component {
          arrow = () => 42

          render() {
            return this.arrow()
          }

          __reactstandin__regenerateByEval(key, code) {
            this[key] = eval(code)
          }
        }

        const proxy = createProxy(BaseClass)
        const Proxy = proxy.get()
        const instance = new Proxy()
        expect(instance.render()).toBe(42)

        proxy.update(Update1Class)
        new Proxy() // side effect
        expect(instance.render()).toBe(43)

        proxy.update(Update2Class)
        new Proxy() // side effect

        expect(instance.render()).toBe(42)
        /* eslint-enable */
      })

      it('should reflect external dependencies(broken, regression)', () => {
        /* eslint-disable */
        const externalValue = 42
        let gen = 0
        const generator2 = () => {
          const g = gen++
          return () => g
        }
        const generator3 = () => {
          const g = gen++
          return () => g
        }

        class BaseClass extends React.Component {
          secret1 = 1
          secret2 = generator2()
          secret3 = generator3()
          arrow1 = () => externalValue
          arrow2 = () => this.secret1 + externalValue

          render() {
            return (
              this.arrow1() +
              ':' +
              this.arrow2() +
              ':' +
              this.secret2() +
              ':' +
              this.secret3()
            )
          }

          __reactstandin__regenerateByEval(key, code) {
            this[key] = eval(code)
          }
        }

        const proxy = createProxy(BaseClass)
        const Proxy = proxy.get()
        const instance = new Proxy()
        expect(instance.render()).toBe(42 + ':' + 43 + ':' + 0 + ':' + 1)

        {
          const externalValue = 24

          class Update1Class extends React.Component {
            secret = 1
            secret2 = generator2()
            secret3 = generator3()
            arrow1 = () => externalValue
            arrow2 = () => this.secret1 + externalValue

            render() {
              return (
                this.arrow1() +
                ':' +
                this.arrow2() +
                ':' +
                this.secret2() +
                ':' +
                this.secret3()
              )
            }

            __reactstandin__regenerateByEval(key, code) {
              this[key] = eval(code)
            }
          }

          proxy.update(Update1Class)
          new Proxy()
        }
        /* eslint-enable */

        // Arrow1 function refer to external variable
        // Will not be updated
        // while Arrow2 function will

        // secret 3 should not be regenrated
        // secret 4(this inside) should be regenrated
        expect(instance.render()).toMatch(/([\d]+):25:0:1/)
      })

      it('should stand-for all class members', () => {
        class Initial {
          constructor() {
            this.methodB = this.methodB.bind(this)
          }

          methodA() {}

          methodB() {}

          render() {}
        }

        const proxy = createProxy(Initial)
        const Class = proxy.get()
        expect(Object.getOwnPropertyNames(Class.prototype)).toEqual([
          'constructor',
          'methodA',
          'methodB',
          'render',
          'hotComponentRender',
          'componentDidMount',
          'componentDidUpdate',
          'componentWillUnmount',
        ])
      })
    })
  })

  describe('proxy creation', () => {
    it('should wrap Component by Proxy', () => {
      class App extends React.Component {
        render() {
          return <div />
        }
      }

      const Proxy = createProxy(App).get()
      const instance = mount(<Proxy />).instance()
      expect(instance instanceof App).toBe(true)
    })

    describe('should wrap SFC by SFC', () => {
      it('should wrap SFC by SFC Component', () => {
        const App = () => <div />

        const Proxy = createProxy(App).get()
        expect('isStatelessFunctionalProxy' in Proxy).toBe(false)
        mount(<Proxy />).instance()
        expect(Proxy.isStatelessFunctionalProxy).toBe(false)
      })

      it('should wrap SFC by SFC Pure', () => {
        const App = () => <div />
        configuration.pureSFC = true
        const Proxy = createProxy(App).get()
        expect('isStatelessFunctionalProxy' in Proxy).toBe(false)
        mount(<Proxy />).instance()
        configuration.pureSFC = false
        expect(Proxy.isStatelessFunctionalProxy).toBe(true)
      })
    })

    it('should wrap SFC with Context by Proxy', () => {
      const App = () => <div />
      App.contextTypes = {}

      const Proxy = createProxy(App).get()
      expect('isStatelessFunctionalProxy' in Proxy).toBe(false)
      mount(<Proxy />).instance()
      expect(Proxy.isStatelessFunctionalProxy).toBe(false)
    })

    it('should not update not constructed Proxies', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()

      class App extends React.Component {
        constructor() {
          super()
          spy1()
        }

        render() {
          return <div />
        }
      }

      const proxy = createProxy(App)
      expect(spy1).not.toHaveBeenCalled()
      expect(spy1).not.toHaveBeenCalled()
      {
        class App extends React.Component {
          constructor() {
            super()
            spy2()
          }

          render() {
            return <div />
          }
        }

        proxy.update(App)

        expect(spy1).not.toHaveBeenCalled()
        expect(spy1).not.toHaveBeenCalled()

        const Proxy = proxy.get()
        mount(<Proxy />)

        expect(spy1).toHaveBeenCalled()
        expect(spy1).toHaveBeenCalled()
      }
    })

    it('should update constructed Proxies', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()

      class App extends React.Component {
        constructor() {
          super()
          spy1()
        }

        render() {
          return <div />
        }
      }

      const proxy = createProxy(App)
      const Proxy = proxy.get()
      mount(<Proxy />)
      expect(spy1).toHaveBeenCalled()
      expect(spy2).not.toHaveBeenCalled()
      {
        class App extends React.Component {
          constructor() {
            super()
            spy2()
          }

          render() {
            return <div />
          }
        }

        proxy.update(App)

        expect(spy1).toHaveBeenCalled()
        expect(spy2).toHaveBeenCalled()
      }
    })
  })

  describe('modern only', () => {
    it('sets up the constructor name from initial name', () => {
      const { Bar, Baz } = createFixtures().modern
      const proxy = createProxy(Bar)
      const Proxy = proxy.get()
      expect(Proxy.name).toBe('Bar')

      proxy.update(Baz)
      expect(Proxy.name).toBe('Baz')
    })

    it('should not crash if new Function() throws', () => {
      const { Bar } = createFixtures().modern
      const oldFunction = global.Function

      global.Function = class extends oldFunction {
        constructor() {
          super()

          throw new Error()
        }
      }

      try {
        expect(() => {
          const proxy = createProxy(Bar)
          const Proxy = proxy.get()
          const barInstance = mount(<Proxy />).instance()
          expect(barInstance.constructor).toBe(Proxy)
        }).not.toThrow()
      } finally {
        global.Function = oldFunction
      }
    })
  })
})
