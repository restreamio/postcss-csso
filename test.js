var assert = require('assert');
var postcss = require('postcss');
var postcssCsso = require('./index.js');

// make postcss work on node.js 0.10
global.Promise = require('es6-promise-polyfill').Promise;

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

describe('should accept options for compress', function() {
    var css = '.a { color: #ff0000; } .b { color: rgba(255, 0, 0, 1) }';
    var minified = '.a,.b{color:red}';
    var minifiedNoRestructure = '.a{color:red}.b{color:red}';

    it('restruture on', function() {
        return postcss().use(postcssCsso({ restructure: true })).process(css).then(function(result) {
            assert.equal(result.css, minified);
        });
    });

    it('restruture off', function() {
        return postcss().use(postcssCsso({ restructure: false })).process(css).then(function(result) {
            assert.equal(result.css, minifiedNoRestructure);
        });
    });
});

describe('edge cases', function() {
    it('should process empty', function() {
        return postcss().use(postcssCsso).process('').then(function(result) {
            assert.equal(result.css, '');
        });
    });

    it('should process block with no selector', function() {
        return postcss().use(postcssCsso).process('{foo:1}').then(function(result) {
            assert.equal(result.css, '');
        });
    });

    it('should process partial inited nodes', function() {
        var emptyGenerator = postcss.plugin('emptyGenerator', function() {
            return function(root) {
                var atRule = postcss.atRule({
                    name: 'test'
                });
                var rule = postcss.rule();

                rule.append(postcss.decl());

                root.append(atRule);
                root.append(rule);
            };
        });

        return postcss([
            emptyGenerator,
            postcssCsso
        ]).process('').then(function(result) {
            assert.equal(result.css, '@test;');
        });
    });
});

it('should keep the shape of original postcss nodes', function() {
    var css = '.a { p: 1; } .b { p: 2; }';
    var count = 0;

    var marker = postcss.plugin('marker', function() {
        return function(root) {
            root.walkRules(function(node) {
                node.marker = 1;
            });
        };
    });
    var checker = postcss.plugin('checker', function() {
        return function(root) {
            root.walkRules(function(node) {
                count += node.marker;
            });
        };
    });

    return postcss([
        marker,
        postcssCsso,
        checker
    ]).process(css).then(function() {
        assert.equal(count, 2);
    });
});

it('error handling', function() {
    return postcss([
        postcssCsso
    ]).process('.test { color: $ }').then(function() {
        assert(false, 'shouldn\'t to be successful');
    }, function(error) {
        assert.equal(error.name, 'CssSyntaxError');
        assert.equal(error.line, 1);
        assert.equal(error.column, 16);
    });
});

// currently works only is used as linked package
// TODO: find the way to use csso compress tests
try {
    describe('should pass csso compress tests', function() {
        function normalizeNewlines(str) {
            return str.replace(/\r/g, '');
        }

        function createCompressTest(name, test) {
            it(name, function() {
                var plugin = test.options ? postcssCsso(test.options) : postcssCsso;
                return postcss([plugin]).process(test.source).then(function(result) {
                    assert.equal(
                        normalizeNewlines(result.css),
                        normalizeNewlines(test.compressed)
                    );
                });
            });
        }

        var compressTests = require('./node_modules/csso/test/fixture/compress/');
        for (var filename in compressTests) {
            if (!/_[^\/]+\.css/.test(filename)) {
                createCompressTest('node_modules/csso/' + filename, compressTests[filename]);
            }
        }
    });
} catch (e) {
    // should throw exception when no csso fixture found
}
