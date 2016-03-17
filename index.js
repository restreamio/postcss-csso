var postcss = require('postcss');
var compress = require('csso').compress;
var postcssToCsso = require('./lib/postcssToCsso.js');
var cssoToPostcss = require('./lib/cssoToPostcss.js');

var postcssCsso = postcss.plugin('postcss-csso', function postcssCsso(options) {
    // force set outputAst:internal to options until csso need it for backward capability
    // TODO: remove it when possible
    options = Object.create(options && typeof options === 'object' ? options : null, {
        outputAst: {
            value: 'internal'
        }
    });

    return function(root, result) {
        result.root = cssoToPostcss(compress(postcssToCsso(root), options));
    };
});

postcssCsso.process = function(css, options) {
    return postcss([postcssCsso(options)]).process(css);
};

module.exports = postcssCsso;
