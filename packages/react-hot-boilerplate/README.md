react-hot-boilerplate
=====================

The minimal dev environment to enable live-editing React components.

### Usage

```
npm install
npm start
open http://localhost:3000
```

you can specify other port:

```
npm config set react-hot-boilerplate:port 8080
npm start
open http://localhost:8080
```

Now edit `scripts/App.js`.  
Your changes will appear without reloading the browser like in [this video](http://vimeo.com/100010922).

### Using with localtunnel

To open this page on other machine, you can use [localtunnel](https://github.com/defunctzombie/localtunnel) service

```
npm config set react-hot-boilerplate:port 8080
npm config set react-hot-boilerplate:subdomain reacthotboilerplate123
npm start
lt --port 8080 --subdomain reacthotboilerplate123
open https://reacthotboilerplate123.localtunnel.me
```

### Dependencies

* React
* Webpack
* [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
* [jsx-loader](https://github.com/petehunt/jsx-loader)
* [react-hot-loader](https://github.com/gaearon/react-hot-loader)

### Resources

* [Demo video](http://vimeo.com/100010922)
* [react-hot-loader on Github](https://github.com/gaearon/react-hot-loader)
* [Integrating JSX live reload into your workflow](gaearon.github.io/react-hot-loader/)
* Ping dan_abramov on Twitter or #reactjs IRC