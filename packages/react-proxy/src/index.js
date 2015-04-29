if (process.env.NODE_ENV !== 'production') {
  export default from './getHotify';
} else {
  function noop() { }
  export default () => noop;
}