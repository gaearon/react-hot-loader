// @flow
import React from 'react'

const ErrorBoundary = ({
  error,
  errorInfo,
}: {
  error: any,
  errorInfo: Object,
}) => (
  <div
    style={{
      margin: '20px auto',
      padding: '10px',
      background: 'white',
      border: '1px solid #555',
      borderRadius: '5px',
      width: '80%',
    }}
  >
    <h2 style={{ margin: 0 }}>{'Oh-no! Something went wrong'}</h2>
    <p style={{ color: 'red' }}>{error && error.toString()}</p>
    <div>Stacktrace:</div>
    <div style={{ color: 'red', marginTop: '10px' }}>
      {errorInfo &&
        errorInfo.componentStack &&
        errorInfo.componentStack
          .split('\n')
          .map((line, i) => <div key={i}>{line}</div>)}
    </div>
  </div>
)

export default ErrorBoundary
