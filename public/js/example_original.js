/* Based on a React example by Martin Angelov (http://goo.gl/xamJFj) */

// YOU ARE THE JAVASCRIPT GOD.

// Remove libraries from the list until the perfect stack emerges.
// (Hint: don't take this too far. We'll need a few for the demo!)

var BEST_JS_LIBS = [
  { name: 'Backbone.js', url: 'http://backbonejs.org/'},
  { name: 'AngularJS', url: 'https://angularjs.org/'},
  { name: 'jQuery', url: 'http://jquery.com/'},
  { name: 'Prototype', url: 'http://www.prototypejs.org/'},
  { name: 'React', url: 'http://facebook.github.io/react/'},
  { name: 'Ember', url: 'http://emberjs.com/'},
  { name: 'Knockout.js', url: 'http://knockoutjs.com/'},
  { name: 'Dojo', url: 'http://dojotoolkit.org/'},
  { name: 'Mootools', url: 'http://mootools.net/'},
  { name: 'Underscore', url: 'http://underscorejs.org/'},
  { name: 'Lodash', url: 'http://lodash.com/'},
  { name: 'Moment', url: 'http://momentjs.com/'},
  { name: 'Express', url: 'http://expressjs.com/'},
  { name: 'Koa', url: 'http://koajs.com/'}
];

// Let's make this more fun.

// First, type “rx” into the input to the right.
// Have you typed “rx” there? True-true? Then uncomment this line:

// BEST_JS_LIBS.push({ name: 'Rx', url: 'http://reactivex.io/' });

module.exports = React.createClass({
  getInitialState() { return { query: '' }; },

  handleChange(e) {
    this.setState({ query: e.target.value });

    // Feel like debugging something?
    // Open DevTools and uncomment next line:

    // console.log(e); debugger;

    // Now type something into the input.
    // Nice, huh? Remove this line so we can move on.
  },

  componentWillUnmount() {
    alert('I knew Dan lied about hot reloading.');
  },

  render() {
    var libs = BEST_JS_LIBS,
        query = this.state.query.trim().toLowerCase();

    // For the next bits of fun, make sure you
    // have typed something into the input!

    if (query.length > 0) {
      libs = libs.filter(
        // Feeling lucky? Try swapping these lines:
        // () => Math.random() > 0.5
        lib => lib.name.toLowerCase().match(query)
      );
    }

    // You know what to do:
    // return <i>{libs.map(l => l.name).join(', ')} are friends!</i>;

    return (
      <div>
        <input type='text' // try 'date'
               value={this.state.query/*.toUpperCase()*/}
               onChange={this.handleChange}
               // onMouseEnter={() => this.setState({ query: 'react' })}
               placeholder='Type to search' />
        <ul>
          {libs.map(lib =>
            <li key={lib.name}>
              <a href={lib.url} target='_blank'>
              {
                // 'Such ' +
                lib.name
              }
              </a>
            </li>
          )}
        </ul>
        {
          // libs.length === 0 && <i>Empty!</i>
        }
      </div>
    );
  }
});