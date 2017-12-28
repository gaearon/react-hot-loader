import shallowEqual from 'shallowequal'

const RESERVED_STATICS = [
  'length',
  'displayName',
  'name',
  'arguments',
  'caller',
  'prototype',
  'toString',
  'valueOf',
]

function transferStaticProps(
  ProxyComponent,
  savedDescriptors,
  PreviousComponent,
  NextComponent,
) {
  Object.getOwnPropertyNames(ProxyComponent).forEach(key => {
    if (RESERVED_STATICS.indexOf(key) !== -1) {
      return
    }

    const prevDescriptor = Object.getOwnPropertyDescriptor(ProxyComponent, key)
    const savedDescriptor = savedDescriptors[key]

    if (!shallowEqual(prevDescriptor, savedDescriptor)) {
      Object.defineProperty(NextComponent, key, prevDescriptor)
    }
  })

  // Copy newly defined static methods and properties
  Object.getOwnPropertyNames(NextComponent).forEach(key => {
    if (RESERVED_STATICS.indexOf(key) !== -1) {
      return
    }

    const prevDescriptor =
      PreviousComponent && Object.getOwnPropertyDescriptor(ProxyComponent, key)
    const savedDescriptor = savedDescriptors[key]

    // Skip redefined descriptors
    if (
      prevDescriptor &&
      savedDescriptor &&
      !shallowEqual(savedDescriptor, prevDescriptor)
    ) {
      Object.defineProperty(NextComponent, key, prevDescriptor)
      return
    }

    if (prevDescriptor && !savedDescriptor) {
      Object.defineProperty(ProxyComponent, key, prevDescriptor)
      return
    }

    const nextDescriptor = {
      ...Object.getOwnPropertyDescriptor(NextComponent, key),
      configurable: true,
    }

    savedDescriptors[key] = nextDescriptor
    Object.defineProperty(ProxyComponent, key, nextDescriptor)
  })

  // Remove static methods and properties that are no longer defined
  Object.getOwnPropertyNames(ProxyComponent).forEach(key => {
    if (RESERVED_STATICS.indexOf(key) !== -1) {
      return
    }
    // Skip statics that exist on the next class
    if (NextComponent.hasOwnProperty(key)) {
      return
    }
    // Skip non-configurable statics
    const proxyDescriptor = Object.getOwnPropertyDescriptor(ProxyComponent, key)
    if (proxyDescriptor && !proxyDescriptor.configurable) {
      return
    }

    const prevDescriptor =
      PreviousComponent &&
      Object.getOwnPropertyDescriptor(PreviousComponent, key)
    const savedDescriptor = savedDescriptors[key]

    // Skip redefined descriptors
    if (
      prevDescriptor &&
      savedDescriptor &&
      !shallowEqual(savedDescriptor, prevDescriptor)
    ) {
      return
    }

    Object.defineProperty(ProxyComponent, key, {
      value: undefined,
    })
  })

  return savedDescriptors
}

export default transferStaticProps
