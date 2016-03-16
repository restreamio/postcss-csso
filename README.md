[![NPM version](https://img.shields.io/npm/v/postcss-csso.svg)](https://www.npmjs.com/package/postcss-csso)
[![Build Status](https://travis-ci.org/lahmatiy/postcss-csso.svg?branch=master)](https://travis-ci.org/lahmatiy/postcss-csso)

# postcss-csso

[PostCSS](https://github.com/postcss/postcss) plugin to minify CSS with [CSSO](https://github.com/css/csso).

## Install

```
npm install postcss-csso
```

## Usage

```js
var postcss = require('postcss');
var csso = require('postcss-csso');
var css = '.example { color: #FF0000; }';

postcss().use(csso()).process(css).then(function(result) {
    console.log(result.css);
    // .example{color:red}
});
```

## License

MIT
