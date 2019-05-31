import React from 'react';
import AppContainer from './AppContainer.prod';

const hot = () => {
  if (hot.shouldWrapWithAppContainer) {
    return Component => props => (
      <AppContainer>
        <Component {...props} />
      </AppContainer>
    );
  }
  return Component => Component;
};

hot.shouldWrapWithAppContainer = false;

export default hot;
