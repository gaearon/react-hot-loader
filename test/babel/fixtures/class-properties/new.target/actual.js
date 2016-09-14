class Foo {
  bar = (a, b) => {
    new.target;

    return a(b);
  };
}
