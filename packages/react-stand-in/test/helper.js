/* eslint-disable react/no-render-return-value */
import ReactDOM from 'react-dom'

export function createMounter() {
  const DOMElement = document.createElement('div')
  let internalMount

  beforeEach(() => {
    internalMount = element => {
      const instance = ReactDOM.render(element, DOMElement)

      return {
        instance() {
          return instance
        },
        text() {
          return DOMElement.textContent
        },
      }
    }
  })

  return {
    mount(element) {
      return internalMount(element)
    },
  }
}

export function ensureNoWarnings() {
  /* eslint-env jest */
  let warnSpy

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn')
  })

  afterEach(() => {
    expect(warnSpy).not.toHaveBeenCalled()
  })

  return {
    getWarnSpy() {
      return warnSpy
    },
  }
}
