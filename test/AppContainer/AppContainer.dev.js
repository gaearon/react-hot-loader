import './setup';
import React, { Component } from 'react';
import expect, { createSpy } from 'expect';
import { mount, shallow } from 'enzyme';
import { mapProps } from 'recompose';

import AppContainer from '../../src/AppContainer.dev';
const RHL = global.__REACT_HOT_LOADER__;

function runAllTests(useWeakMap) {
  describe(`<AppContainer /> [useWeakMap == ${useWeakMap}]`, () => {
    beforeEach(() => {
      RHL.reset(useWeakMap);
    });

    describe('with class root', () => {
      it('renders children', () => {
        const spy = createSpy();
        class App extends Component {
          render() {
            spy();
            return <div>hey</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        expect(wrapper.find('App').length).toBe(1);
        expect(wrapper.contains(<div>hey</div>)).toBe(true);
        expect(spy.calls.length).toBe(1);
      });

      it('force updates the tree on receiving new children', () => {
        const spy = createSpy();

        class App extends Component {
          shouldComponentUpdate() {
            return false;
          }

          render() {
            spy();
            return <div>hey</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          class App extends Component {
            shouldComponentUpdate() {
              return false;
            }

            render() {
              spy();
              return <div>ho</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('force updates the tree on receiving cached children', () => {
        const spy = createSpy();

        class App extends Component {
          shouldComponentUpdate() {
            return false;
          }

          render() {
            spy();
            return <div>hey</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const element = <App />;
        const wrapper = mount(<AppContainer>{element}</AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          class App extends Component {
            shouldComponentUpdate() {
              return false;
            }

            render() {
              spy();
              return <div>ho</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: element });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('renders latest children on receiving cached never-rendered children', () => {
        const spy = createSpy();

        class App extends Component {
          shouldComponentUpdate() {
            return false;
          }

          render() {
            spy();
            return <div>hey</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const element = <App />;
        let wrapper;

        {
          class App extends Component {
            shouldComponentUpdate() {
              return false;
            }

            render() {
              spy();
              return <div>ho</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper = mount(<AppContainer>{element}</AppContainer>);
        }

        expect(spy.calls.length).toBe(1);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('hot-reloads children without losing state', () => {
        class App extends Component {
          componentWillMount() {
            this.state = 'old';
          }

          shouldComponentUpdate() {
            return false;
          }

          render() {
            return <div>old render + {this.state} state</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        expect(wrapper.text()).toBe('old render + old state');

        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new';
            }

            shouldComponentUpdate() {
              return false;
            }

            render() {
              return <div>new render + {this.state} state</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        expect(wrapper.text()).toBe('new render + old state');
      });

      it('replaces children class methods', () => {
        const spy = createSpy();

        class App extends Component {
          componentWillMount() {
            this.state = 'old';
          }

          shouldComponentUpdate() {
            return false;
          }

          handleClick() {
            spy('foo');
          }

          render() {
            return (
              <span onClick={this.handleClick}>old render + {this.state} state</span>
            );
          }
        }
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('foo');
        expect(wrapper.text()).toBe('old render + old state');

        spy.reset();
        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new';
            }

            shouldComponentUpdate() {
              return false;
            }

            handleClick() {
              spy('bar');
            }

            render() {
              return (
                <span onClick={this.handleClick}>new render + {this.state} state</span>
              );
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('bar');
        expect(wrapper.text()).toBe('new render + old state');
      });

      it('replaces children class property arrow functions', () => {
        const spy = createSpy();

        class App extends Component {
          componentWillMount() {
            this.state = 'old';
          }

          shouldComponentUpdate() {
            return false;
          }

          handleClick = () => {
            spy('foo');
          };

          render() {
            return (
              <span onClick={this.handleClick}>old render + {this.state} state</span>
            );
          }
        }
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('foo');
        expect(wrapper.text()).toBe('old render + old state');

        spy.reset();
        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new';
            }

            shouldComponentUpdate() {
              return false;
            }

            handleClick = () => {
              spy('bar');
            };

            render() {
              return (
                <span onClick={this.handleClick}>new render + {this.state} state</span>
              );
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('bar');
        expect(wrapper.text()).toBe('new render + old state');
      });

      it('replaces children class arrow functions in constructor', () => {
        const spy = createSpy();

        class App extends Component {
          constructor(props) {
            super(props);

            this.handleClick = () => {
              spy('foo');
            };
          }
          componentWillMount() {
            this.state = 'old';
          }

          shouldComponentUpdate() {
            return false;
          }

          render() {
            return (
              <span onClick={this.handleClick}>old render + {this.state} state</span>
            );
          }
        }
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('foo');
        expect(wrapper.text()).toBe('old render + old state');

        spy.reset();
        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new';
            }

            shouldComponentUpdate() {
              return false;
            }

            handleClick = () => {
              spy('bar');
            };

            render() {
              return (
                <span onClick={this.handleClick}>new render + {this.state} state</span>
              );
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('bar');
        expect(wrapper.text()).toBe('new render + old state');
      });

      it('replaces children class property arrow functions without block statement bodies', () => {
        const spy = createSpy();

        class App extends Component {
          componentWillMount() {
            this.state = 'old';
          }

          shouldComponentUpdate() {
            return false;
          }

          handleClick = () => spy('foo');

          render() {
            return (
              <span onClick={this.handleClick}>old render + {this.state} state</span>
            );
          }
        }
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('foo');
        expect(wrapper.text()).toBe('old render + old state');

        spy.reset();
        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new';
            }

            shouldComponentUpdate() {
              return false;
            }

            handleClick = () => spy('bar');

            render() {
              return (
                <span onClick={this.handleClick}>new render + {this.state} state</span>
              );
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('bar');
        expect(wrapper.text()).toBe('new render + old state');
      });

      it('replaces children with class property arrow ' +
         'functions with different numbers of arguments', () => {
        const spy = createSpy();

        class App extends Component {
          componentWillMount() {
            this.state = 'old';
          }

          shouldComponentUpdate() {
            return false;
          }

          handleClick = () => spy('foo');

          render() {
            return (
              <span onClick={this.handleClick}>old render + {this.state} state</span>
            );
          }
        }
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        wrapper.find('span').simulate('click');
        expect(spy).toHaveBeenCalledWith('foo');
        expect(wrapper.text()).toBe('old render + old state');

        spy.reset();
        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new';
            }

            shouldComponentUpdate() {
              return false;
            }

            handleClick = ({ target }) => spy(target.value);

            render() {
              return (
                <span onClick={this.handleClick}>new render + {this.state} state</span>
              );
            }
          }
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        wrapper.find('span').simulate('click', { target: { value: 'bar' } });
        expect(spy).toHaveBeenCalledWith('bar');
        expect(wrapper.text()).toBe('new render + old state');
      });
    });

    describe('with createClass root', () => {
      it('renders children', () => {
        const spy = createSpy();
        const App = React.createClass({
          render() {
            spy();
            return <div>hey</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        expect(wrapper.find('App').length).toBe(1);
        expect(wrapper.contains(<div>hey</div>)).toBe(true);
        expect(spy.calls.length).toBe(1);
      });

      it('force updates the tree on receiving new children', () => {
        const spy = createSpy();

        const App = React.createClass({
          shouldComponentUpdate() {
            return false;
          },

          render() {
            spy();
            return <div>hey</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          const App = React.createClass({
            shouldComponentUpdate() {
              return false;
            },

            render() {
              spy();
              return <div>ho</div>;
            },
          });
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('force updates the tree on receiving cached children', () => {
        const spy = createSpy();

        const App = React.createClass({
          shouldComponentUpdate() {
            return false;
          },

          render() {
            spy();
            return <div>hey</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');

        const element = <App />;
        const wrapper = mount(<AppContainer>{element}</AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          const App = React.createClass({
            shouldComponentUpdate() {
              return false;
            },

            render() {
              spy();
              return <div>ho</div>;
            },
          });
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: element });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('renders latest children on receiving cached never-rendered children', () => {
        const spy = createSpy();

        const App = React.createClass({
          shouldComponentUpdate() {
            return false;
          },

          render() {
            spy();
            return <div>hey</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');

        const element = <App />;
        let wrapper;

        {
          const App = React.createClass({
            shouldComponentUpdate() {
              return false;
            },

            render() {
              spy();
              return <div>ho</div>;
            },
          });
          RHL.register(App, 'App', 'test.js');
          wrapper = mount(<AppContainer>{element}</AppContainer>);
        }

        expect(spy.calls.length).toBe(1);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('hot-reloads children without losing state', () => {
        const App = React.createClass({
          componentWillMount() {
            this.state = 'old';
          },

          shouldComponentUpdate() {
            return false;
          },

          render() {
            return <div>old render + {this.state} state</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        expect(wrapper.text()).toBe('old render + old state');

        {
          const App = React.createClass({
            componentWillMount() {
              this.state = 'new';
            },

            shouldComponentUpdate() {
              return false;
            },

            render() {
              return <div>new render + {this.state} state</div>;
            },
          });
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        expect(wrapper.text()).toBe('new render + old state');
      });
    });

    describe('with createFactory root', () => {
      it('renders children', () => {
        const spy = createSpy();
        const App = React.createClass({
          render() {
            spy();
            return <div>hey</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');
        const AppF = React.createFactory(App);

        const wrapper = mount(<AppContainer>{AppF()}</AppContainer>);
        expect(wrapper.find('App').length).toBe(1);
        expect(wrapper.contains(<div>hey</div>)).toBe(true);
        expect(spy.calls.length).toBe(1);
      });

      it('force updates the tree on receiving new children', () => {
        const spy = createSpy();

        const App = React.createClass({
          shouldComponentUpdate() {
            return false;
          },

          render() {
            spy();
            return <div>hey</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');
        const AppF = React.createFactory(App);

        const wrapper = mount(<AppContainer>{AppF()}</AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          const App = React.createClass({
            shouldComponentUpdate() {
              return false;
            },

            render() {
              spy();
              return <div>ho</div>;
            },
          });
          RHL.register(App, 'App', 'test.js');
          const AppF = React.createFactory(App);
          wrapper.setProps({ children: AppF() });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('force updates the tree on receiving cached children', () => {
        const spy = createSpy();

        const App = React.createClass({
          shouldComponentUpdate() {
            return false;
          },

          render() {
            spy();
            return <div>hey</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');
        const AppF = React.createFactory(App);

        const element = AppF();
        const wrapper = mount(<AppContainer>{element}</AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          const App = React.createClass({
            shouldComponentUpdate() {
              return false;
            },

            render() {
              spy();
              return <div>ho</div>;
            },
          });
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: element });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('renders latest children on receiving cached never-rendered children', () => {
        const spy = createSpy();

        const App = React.createClass({
          shouldComponentUpdate() {
            return false;
          },

          render() {
            spy();
            return <div>hey</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');
        const AppF = React.createFactory(App);

        const element = AppF();
        let wrapper;

        {
          const App = React.createClass({
            shouldComponentUpdate() {
              return false;
            },

            render() {
              spy();
              return <div>ho</div>;
            },
          });
          RHL.register(App, 'App', 'test.js');
          wrapper = mount(<AppContainer>{element}</AppContainer>);
        }

        expect(spy.calls.length).toBe(1);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('hot-reloads children without losing state', () => {
        const App = React.createClass({
          componentWillMount() {
            this.state = 'old';
          },

          shouldComponentUpdate() {
            return false;
          },

          render() {
            return <div>old render + {this.state} state</div>;
          },
        });
        RHL.register(App, 'App', 'test.js');
        const AppF = React.createFactory(App);

        const wrapper = mount(<AppContainer>{AppF()}</AppContainer>);
        expect(wrapper.text()).toBe('old render + old state');

        {
          const App = React.createClass({
            componentWillMount() {
              this.state = 'new';
            },

            shouldComponentUpdate() {
              return false;
            },

            render() {
              return <div>new render + {this.state} state</div>;
            },
          });
          RHL.register(App, 'App', 'test.js');
          const AppF = React.createFactory(App);
          wrapper.setProps({ children: AppF() });
        }

        expect(wrapper.text()).toBe('new render + old state');
      });
    });

    describe('with SFC root', () => {
      it('renders children', () => {
        const spy = createSpy();
        const App = () => {
          spy();
          return <div>hey</div>;
        };
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        expect(wrapper.find('App').length).toBe(1);
        expect(wrapper.contains(<div>hey</div>)).toBe(true);
        expect(spy.calls.length).toBe(1);
      });

      it('force updates the tree on receiving new children', () => {
        const spy = createSpy();

        const App = () => {
          spy();
          return <div>hey</div>;
        };
        RHL.register(App, 'App', 'test.js');

        const wrapper = mount(<AppContainer><App /></AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          const App = () => {
            spy();
            return <div>ho</div>;
          };
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: <App /> });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('force updates the tree on receiving cached children', () => {
        const spy = createSpy();

        const App = () => {
          spy();
          return <div>hey</div>;
        };
        RHL.register(App, 'App', 'test.js');

        const element = <App />;
        const wrapper = mount(<AppContainer>{element}</AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          const App = () => {
            spy();
            return <div>ho</div>;
          };
          RHL.register(App, 'App', 'test.js');
          wrapper.setProps({ children: element });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('renders latest children on receiving cached never-rendered children', () => {
        const spy = createSpy();

        const App = () => {
          spy();
          return <div>hey</div>;
        };
        RHL.register(App, 'App', 'test.js');

        const element = <App />;
        let wrapper;

        {
          const App = () => {
            spy();
            return <div>ho</div>;
          };
          RHL.register(App, 'App', 'test.js');
          wrapper = mount(<AppContainer>{element}</AppContainer>);
        }

        expect(spy.calls.length).toBe(1);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('hot-reloads children without losing state', () => {
        class App extends Component {
          componentWillMount() {
            this.state = 'old';
          }

          shouldComponentUpdate() { return false; }

          render() {
            return <div>old render + {this.state} state</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const Root = () => <App />;
        RHL.register(Root, 'Root', 'test.js');

        const wrapper = mount(<AppContainer><Root /></AppContainer>);
        expect(wrapper.text()).toBe('old render + old state');

        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new';
            }

            shouldComponentUpdate() { return false; }

            render() {
              return <div>new render + {this.state} state</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');

          const Root = () => <App />;
          RHL.register(Root, 'Root', 'test.js');
          wrapper.setProps({ children: <Root /> });
        }

        expect(wrapper.text()).toBe('new render + old state');
      });
    });

    describe('with HOC-wrapped root', () => {
      it('renders children', () => {
        const spy = createSpy();
        class App extends React.Component {
          render() {
            spy();
            return <div>hey</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
        RHL.register(Enhanced, 'Enhanced', 'test.js');

        const wrapper = mount(<AppContainer><Enhanced n={3} /></AppContainer>);
        expect(wrapper.find('App').length).toBe(1);
        expect(wrapper.contains(<div>hey</div>)).toBe(true);
        expect(wrapper.find('App').prop('n')).toBe(15);
        expect(spy.calls.length).toBe(1);
      });

      it('force updates the tree on receiving new children', () => {
        const spy = createSpy();
        class App extends React.Component {
          render() {
            spy();
            return <div>hey</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
        RHL.register(Enhanced, 'Enhanced', 'test.js');

        const wrapper = mount(<AppContainer><Enhanced n={3} /></AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          class App extends React.Component {
            render() {
              spy();
              return <div>ho</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');

          const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
          RHL.register(Enhanced, 'Enhanced', 'test.js');
          wrapper.setProps({ children: <Enhanced n={3} /> });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });


      it('force updates the tree on receiving cached children', () => {
        const spy = createSpy();
        class App extends React.Component {
          render() {
            spy();
            return <div>hey</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
        RHL.register(Enhanced, 'Enhanced', 'test.js');

        const element = <Enhanced n={3} />;
        const wrapper = mount(<AppContainer>{element}</AppContainer>);
        expect(spy.calls.length).toBe(1);

        {
          class App extends React.Component {
            render() {
              spy();
              return <div>ho</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');

          const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
          RHL.register(Enhanced, 'Enhanced', 'test.js');
          wrapper.setProps({ children: element });
        }

        expect(spy.calls.length).toBe(2);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('renders latest children on receiving cached never-rendered children', () => {
        const spy = createSpy();
        class App extends React.Component {
          render() {
            spy();
            return <div>hey</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
        RHL.register(Enhanced, 'Enhanced', 'test.js');

        const element = <Enhanced n={3} />;
        let wrapper;

        {
          class App extends React.Component {
            render() {
              spy();
              return <div>ho</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');

          const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
          RHL.register(Enhanced, 'Enhanced', 'test.js');
          wrapper = mount(<AppContainer>{element}</AppContainer>);
        }

        expect(spy.calls.length).toBe(1);
        expect(wrapper.contains(<div>ho</div>)).toBe(true);
      });

      it('hot-reloads children without losing state', () => {
        class App extends Component {
          componentWillMount() {
            this.state = 'old';
          }

          shouldComponentUpdate() { return false; }

          render() {
            return <div>old render + {this.state} state + {this.props.n}</div>;
          }
        }
        RHL.register(App, 'App', 'test.js');

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
        RHL.register(Enhanced, 'Enhanced', 'test.js');

        const wrapper = mount(<AppContainer><Enhanced n={3} /></AppContainer>);
        expect(wrapper.text()).toBe('old render + old state + 15');

        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new';
            }

            shouldComponentUpdate() { return false; }

            render() {
              return <div>new render + {this.state} state + {this.props.n}</div>;
            }
          }
          RHL.register(App, 'App', 'test.js');

          const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App);
          RHL.register(Enhanced, 'Enhanced', 'test.js');
          wrapper.setProps({ children: <Enhanced n={4} /> });
        }

        expect(wrapper.text()).toBe('new render + old state + 20');
      });
    });

    describe('should use Redbox as the default errorReporter', () => {
      const wrapper = shallow(<AppContainer><div>hey</div></AppContainer>);
      const error = new Error('Something is wrong!');
      wrapper.setState({ error });
      const errorReporter = wrapper.find('RedBox');
      expect(errorReporter.length).toBe(1);
      expect(errorReporter.prop('error')).toBe(error);
    });
  });
}

runAllTests(true);
runAllTests(false);
