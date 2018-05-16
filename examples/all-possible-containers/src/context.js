import React from 'react'

const Context = React.createContext('dummy-value')

export const connect = WrappedComponent => {
  const ConnectComponent = props => (
    <Context.Consumer>
      {value => <WrappedComponent {...props} consumedValue={value} />}
    </Context.Consumer>
  )
  ConnectComponent.displayName = `Connect(${WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Unknown'})`
  return ConnectComponent
}

export default Context
