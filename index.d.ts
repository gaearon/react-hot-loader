import {ComponentClass, StatelessComponent} from "react";

interface ErrorReporterProps {
  error: Error;
}

interface AppContainerProps {
  errorReporter?: ComponentClass<ErrorReporterProps> | StatelessComponent<ErrorReporterProps>;
}

export const AppContainer: ComponentClass<AppContainerProps>;
