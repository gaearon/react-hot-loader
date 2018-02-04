import shallowEqual from 'shallowequal'
import { safeDefineProperty } from './utils'
import { PROXY_KEY, UNWRAP_PROXY } from './constants'

const RESERVED_STATICS = [
  'length',
  'displayName',
  'name',
  'arguments',
  'caller',
  'prototype',
  'toString',
  'valueOf',
  PROXY_KEY,
  UNWRAP_PROXY,
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
      safeDefineProperty(NextComponent, key, prevDescriptor)
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
      safeDefineProperty(NextComponent, key, prevDescriptor)
      return
    }

    if (prevDescriptor && !savedDescriptor) {
      safeDefineProperty(ProxyComponent, key, prevDescriptor)
      return
    }

    const nextDescriptor = {
      ...Object.getOwnPropertyDescriptor(NextComponent, key),
      configurable: true,
    }

    savedDescriptors[key] = nextDescriptor
    safeDefineProperty(ProxyComponent, key, nextDescriptor)
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

    safeDefineProperty(ProxyComponent, key, {
      value: undefined,
    })
  })

  return savedDescriptors
}

export default transferStaticProps
