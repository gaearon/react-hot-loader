import { hot } from 'react-hot-loader/root';
import { setConfig } from 'react-hot-loader';
import * as React from 'react';
import styled from 'styled-components';
import emoStyled from 'react-emotion';
import './config';
import Counter from './Counter';
import { SpringTest } from './Spring';

// const genApp = () => {
const BigText = styled.div`
  font-size: 25px;
`;

const SmallText = emoStyled('div')`
  font-size: 22px;
`;

const indirect = {
  element: () => (
    <SmallText>
      hidden <Counter />
    </SmallText>
  ),
};

const indirectStyled = {
  DS: styled.div`
    border: 20px solid #f00;
  `,
  DE: emoStyled('div')`border: 1px solid #F00`,
};

const Async = React.lazy(() => import('./Async'));

const aNumber = 200500;

const OtherComponent = () => <span>test</span>;

const Context = React.createContext();

const Hook = () => {
  const [state, setState] = React.useState({ x: 4 });
  React.useEffect(() => {
    console.log('mount effected 1');
    setState(state => ({
      x: state.x + 1,
    }));
  }, []);

  React.useEffect(
    () => {
      console.log('hot effected');
      setState(state => ({
        x: state.x + 0.5,
      }));
    },
    ['hot'],
  );

  //React.useState(0);
  return (
    <div>
      hook state 1: {state.x}
      <Counter />
    </div>
  );
};

const Memo1 = React.memo(() => (
  <div>
    [mem <OtherComponent />
    <Counter /> memo]
  </div>
));

const Memo2 = React.memo(
  class extends React.Component {
    render() {
      return (
        <div>
          [mem2 <Counter /> memo]
        </div>
      );
    }
  },
);

const Memo3 = React.memo(
  React.forwardRef(() => (
    <div>
      [double memo 3 <OtherComponent />
      <Counter /> memo]
    </div>
  )),
);

const TwinComponents = [
  ({ children }) => <div data-twin="1">{children}</div>,
  ({ children }) => <div data-twin="2">{children}</div>,
];

const TwinComponent = props => {
  const Twin = TwinComponents[window.twinId || 0];
  return <Twin {...props} />;
};

const InApp = () => (
  <h1>
    <SpringTest />
    <BigText>
      <TwinComponent>
        1. Hello, world! {aNumber} <Counter />
      </TwinComponent>
    </BigText>
    hook:
    <Hook />
    <br />
    <SmallText>
      2.Hello, world! <Counter />.
    </SmallText>
    <br />
    <Counter />
    <Context.Provider>
      <Memo1 a1 a2 />
    </Context.Provider>
    <Memo2 a1 a2 />
    <Memo3 a1 a2 />
    <div>
      <React.Suspense fallback="loading">
        <Async />
      </React.Suspense>
    </div>
    <indirect.element />
    <indirectStyled.DS>
      {' '}
      indirect DS <Counter />{' '}
    </indirectStyled.DS>
    <indirectStyled.DE>
      {' '}
      indirect DE <Counter />{' '}
    </indirectStyled.DE>
    <div>{[<span key={1}>depend on aNumber - </span>, aNumber % 2 && <indirect.element key="2" />]}</div>
  </h1>
);

const App = () => <InApp />;

setConfig({
  logLevel: 'debug',
  hotHooks: true,
});

//   return App;
// }
//
// const App = genApp();

export default hot(App);
