import * as React from "react";
import {AppContainer} from "../../../index";

// Mock custom error reporters
interface Props {
  error: Error
}
class CustomReporter1 extends React.Component<Props, {}> {}
const CustomReporter2 = ({error}: Props) => <pre>{error.stack}</pre>;

// Scenario 1 - default error reporter
const component0 = (
  <AppContainer>
    <div />
  </AppContainer>
);

// Scenario 2 - custom error reporter
const component1 = (
  <AppContainer errorReporter={CustomReporter1}>
    <div />
  </AppContainer>
);

// Scenario 3 - stateless custom error reporter
const component2 = (
  <AppContainer errorReporter={CustomReporter2}>
    <div />
  </AppContainer>
);
