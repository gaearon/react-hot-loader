/* eslint-disable react/prop-types */

import React from 'react';

function AppContainer(props) {
  if (AppContainer.warnAboutHMRDisabled) {
    AppContainer.warnAboutHMRDisabled = true;
    console.error(
      'React-Hot-Loader: misconfiguration detected, using production version in non-production environment.',
    );
    console.error('React-Hot-Loader: Hot Module Replacement is not enabled.');
  }
  return React.Children.only(props.children);
}

AppContainer.warnAboutHMRDisabled = false;

export default AppContainer;
