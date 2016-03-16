var postcss = require('postcss');
var csso = require('csso').compress;
var postcssToCsso = require('./lib/postcssToCsso.js');
var cssoToPostcss = require('./lib/cssoToPostcss.js');

function extend(dest, source) {
    return Object.keys(source).reduce(function(result, key) {
        dest[key] = source[key];
        return dest;
    }, dest || {});
}
 
var postcssCsso = postcss.plugin('postcss-csso', function postcssCsso(options) {
    return function(root, result) {
        result.root = cssoToPostcss(csso(postcssToCsso(root), extend({
            outputAst: true
        }, options || {})));
    }
});

postcssCsso.process = function(css, options) {
    return postcss([postcssCsso(options)]).process(css);
};

module.exports = postcssCsso;
