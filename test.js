var assert = require('assert');
var postcss = require('postcss');
var postcssCsso = require('./index.js');

describe('can be used as a postcss plugin', function() {
    var css = '.a { color: #ff0000; } @media all { .b { color: rgba(255, 0, 0, 1) } }';
    var minified = '.a{color:red}@media all{.b{color:red}}';

    it('via .use()', function() {
        return postcss().use(postcssCsso()).process(css).then(function(result) {
            assert.equal(result.css, minified);
        });
    });

    it('via postcss([..]) w/o config', function() {
        return postcss([postcssCsso]).process(css).then(function(result) {
            assert.equal(result.css, minified);
        });
    });

    it('via postcss([..]) w/ config', function() {
        return postcss([postcssCsso({})]).process(css).then(function(result) {
            assert.equal(result.css, minified);
        });
    });
});
