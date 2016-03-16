[![NPM version](https://img.shields.io/npm/v/postcss-csso.svg)](https://www.npmjs.com/package/postcss-csso)
[![Build Status](https://travis-ci.org/lahmatiy/postcss-csso.svg?branch=master)](https://travis-ci.org/lahmatiy/postcss-csso)

# postcss-csso

[PostCSS](https://github.com/postcss/postcss) plugin to minify CSS with [CSSO](https://github.com/css/csso).

> If you have any difficulties with the output of this plugin, please use the [CSSO tracker](https://github.com/css/csso/issues).

## Install

```
npm install postcss-csso
```

## Usage

```js
var postcss = require('postcss');
var csso = require('postcss-csso');

postcss([
    csso
])
    .process('.a { color: #FF0000; } .b { color: rgba(255, 0, 0, 1) }')
    .then(function(result) {
        console.log(result.css);
        // .a,.b{color:red}
    });

// you also can pass an options
postcss([
    csso({ restructure: false })
])
    .process('.a { color: red; } .b { color: red; }')
    .then(function(result) {
        console.log(result.css);
        // .a{color:red}.b{color:red}
    });
```

## License

MIT
