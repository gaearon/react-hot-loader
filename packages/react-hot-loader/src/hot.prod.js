// use es5 code for prod

export default function hot() {
  return function hotExported(Component) {
    return Component
  }
}
