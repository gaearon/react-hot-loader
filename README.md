# [Did](https://mdo.github.io/did)

[Did](http://mdo.github.io/did) is a [Jekyll](http://jekyllrb.com) theme, designed and built by [@mdo](https://twitter.com/mdo). It's based on another theme, [Hyde](http://andhyde.com). Did is designed to showcase your content first and foremost. Navigation and extraneous information remains offscreen until the reader requests it.

![Did](https://f.cloud.github.com/assets/98681/1819955/697ac4c8-70c0-11e3-8d34-403dac775329.png)
![Did with open sidebar](https://f.cloud.github.com/assets/98681/1819956/697b6e5a-70c0-11e3-8fe9-b8098f9c61e5.png)

The name originates from a rather well-known, and unsurprisingly relevant, psychiatric condition, [dissociative identity disorder](http://en.wikipedia.org/wiki/Dissociative_identity_disorder). (Protip: It's just like Dr. Jekyll & Mr. Hyde.)


## Usage

### 1. Install Jekyll

Did is built for use with Jekyll, so naturally you'll need to install that. On Macs, it's rather straightforward:

```bash
$ gem install jekyll
```

**Windows users:** Windows users have a bit more work to do, but luckily [@juthilo](https://github.com/juthilo) has your back with his [Run Jekyll on Windows](https://github.com/juthilo/run-jekyll-on-windows) guide.

You may also need to install Pygments, the Python syntax highlighter for code snippets that places nicely with Jekyll. Read more about this [in the Jekyll docs](http://jekyllrb.com/docs/templates/#code_snippet_highlighting).

### 2a. Quick start

To help anyone with any level of familiarity with Jekyll quickly get started, Did includes everything you need for a basic Jekyll site. To that end, just download Did and start up Jekyll.

### 2b. Roll your own Jekyll site

Folks wishing to use Jekyll's templates and styles can do so with a little bit of manual labor. Download Did and then copy what you need (likely `_layouts/`, `*.html` files, `atom.xml` for RSS, and `public/` for CSS, JS, etc.).

### 3. Running locally

To see your Jekyll site with Did applied, start a Jekyll server. In Terminal, from `/did` (or whatever your Jekyll site's root directory is named):

```bash
$ jekyll serve
```

Open <http://localhost:4000> in your browser, and voilà. You're done.


## Options

Did includes a some customizable options, typically applied via classes on the `<body>` element.


### Rems, `font-size`, and scaling

Did is built with almost entirely with `rem`s (instead of pixels like Hyde 1.1.x). `rem`s are like `em`s, but instead of building on the immediate parent's `font-size`, they build on the root element, `<html>`.

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


### Sidebar menu

Create a list of nav links in the sidebar by assigning each Jekyll page the correct layout in the page's [front-matter](http://jekyllrb.com/docs/frontmatter/).

```
---
layout: page
title: About
---
```

**Why require a specific layout?** Jekyll will return *all* pages, including the `atom.xml`, and with an alphabetical sort order. To ensure the first link is *Home*, we exclude the `index.html` page from this list by specifying the `page` layout.


### Themes

Just like [Hyde](https://github.com/mdo/hyde), Did ships with eight optional themes based on the [base16 color scheme](https://github.com/chriskempson/base16). Apply a theme to change the color scheme (mostly applies to sidebar and links).

![Did with red theme](https://f.cloud.github.com/assets/98681/1819959/6999645a-70c0-11e3-9086-c451f597ee70.png)
![Did with red theme and open sidebar](https://f.cloud.github.com/assets/98681/1819960/699a181e-70c0-11e3-8696-a6a8f258824e.png)

There are eight themes available at this time.

![Did theme classes](https://f.cloud.github.com/assets/98681/1817044/e5b0ec06-6f68-11e3-83d7-acd1942797a1.png)

To use a theme, add anyone of the available theme classes to the `<body>` element in the `default.html` layout, like so:

```html
<body class="theme-base-08">
  ...
</body>
```

To create your own theme, look to the Themes section of [Did's CSS](https://github.com/mdo/did/blob/master/public/css/did.css). Copy any existing theme (they're only a few lines of CSS), rename it, and change the provided colors.


### Reverse layout

![Did with reverse layout](https://f.cloud.github.com/assets/98681/1819958/698cbe1c-70c0-11e3-861d-a7a2fdc34823.png)
![Did with reverse layout and open sidebar](https://f.cloud.github.com/assets/98681/1819957/698c2d08-70c0-11e3-88c7-6b8e1618b363.png)

Reverse the page orientation with a single class.

```html
<body class="layout-reverse">
  ...
</body>
```


## Author

**Mark Otto**
<https://github.com/mdo>
<https://twitter.com/mdo>


## License

Open sourced under the [MIT license](LICENSE.md).

<3
