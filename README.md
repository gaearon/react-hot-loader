# Poole

In the novel, *The Strange Case of Dr. Jeykll and Mr. Hyde*, Mr. Poole is Dr. Jekyll's virtuous and loyal butler. Similarly, Poole is the Butler for Jekyll themes by [@mdo](https://twitter.com/mdo), providing a clear and concise foundational setup for any Jekyll site.

There are currently two themes built on Poole:

* [Hyde](http://hyde.getpoole.com)
* [Lanyon](http://lanyon.getpoole.com)


## Usage

### 1. Install Jekyll

Poole is built for use with Jekyll, so naturally you'll need to install that. On Macs, it's rather straightforward:

```bash
$ gem install jekyll
```

**Windows users:** Windows users have a bit more work to do, but luckily [@juthilo](https://github.com/juthilo) has your back with his [Run Jekyll on Windows](https://github.com/juthilo/run-jekyll-on-windows) guide.

You may also need to install Pygments, the Python syntax highlighter for code snippets that places nicely with Jekyll. Read more about this [in the Jekyll docs](http://jekyllrb.com/docs/templates/#code_snippet_highlighting).

### 2a. Quick start

To help anyone with any level of familiarity with Jekyll quickly get started, Poole includes everything you need for a basic Jekyll site. To that end, just download Poole and start up Jekyll.

### 2b. Roll your own Jekyll site

Folks wishing to use Jekyll's templates and styles can do so with a little bit of manual labor. Download Poole and then copy what you need (likely `_layouts/`, `*.html` files, `atom.xml` for RSS, and `public/` for CSS, JS, etc.).

### 3. Running locally

To see your Jekyll site with Poole applied, start a Jekyll server. In Terminal, from `/Poole` (or whatever your Jekyll site's root directory is named):

```bash
$ jekyll serve
```

Open <http://localhost:4000> in your browser, and voilà. You're done.


## Options

Poole includes a some customizable options, typically applied via classes on the `<body>` element.


### Rems, `font-size`, and scaling

Poole is built with almost entirely with `rem`s (instead of pixels like Hyde 1.1.x). `rem`s are like `em`s, but instead of building on the immediate parent's `font-size`, they build on the root element, `<html>`.

By default, we use the following:

```css
html {
  font-size: 16px;
  line-height: 1.5;
}
@media (min-width: 48rem) { /* ~768px */
  html {
    font-size: 20px;
  }
}

```

To easily scale your site's typography and components, simply customize the base `font-size`s here.


## Author

**Mark Otto**
<https://github.com/mdo>
<https://twitter.com/mdo>


## License

Open sourced under the [MIT license](LICENSE.md).

<3
