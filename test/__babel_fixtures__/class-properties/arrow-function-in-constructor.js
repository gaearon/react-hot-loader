class PropsInConstructor {
  constructor({ a, b }) {
    this.onClick = (e) => {
      console.log(a, b)
      console.log(e.target.value)
    }
  }
}

class ReturnFunc {
  constructor() {
    this.onClick = (e) => e.target.value
  }
}
