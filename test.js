const assert = require('assert');
const postcss = require('postcss');
const postcssCsso = require('./index.js');

describe('can be used as a postcss plugin', function() {
    const css = '.a { color: #ff0000; } @media all { .b { color: rgba(255, 0, 0, 1) } }';
    const minified = '.a{color:red}@media all{.b{color:red}}';

    it('via .use()', function() {
        return postcss().use(postcssCsso()).process(css).then(function(result) {
            assert.strictEqual(result.css, minified);
        });
    });

    it('via postcss([..]) w/o config', function() {
        return postcss([postcssCsso]).process(css).then(function(result) {
            assert.strictEqual(result.css, minified);
        });
    });

    it('via postcss([..]) w/ config', function() {
        return postcss([postcssCsso({})]).process(css).then(function(result) {
            assert.strictEqual(result.css, minified);
        });
    });
});

describe('should accept options for compress', function() {
    const css = '.a { color: #ff0000; } .b { color: rgba(255, 0, 0, 1) }';
    const minified = '.a,.b{color:red}';
    const minifiedNoRestructure = '.a{color:red}.b{color:red}';

    it('restruture on', function() {
        return postcss().use(postcssCsso({ restructure: true })).process(css).then(function(result) {
            assert.strictEqual(result.css, minified);
        });
    });

    it('restruture off', function() {
        return postcss().use(postcssCsso({ restructure: false })).process(css).then(function(result) {
            assert.strictEqual(result.css, minifiedNoRestructure);
        });
    });
});

describe('edge cases', function() {
    it('should process empty', function() {
        return postcss().use(postcssCsso).process('').then(function(result) {
            assert.strictEqual(result.css, '');
        });
    });

    it('should process block with no selector', function() {
        return postcss().use(postcssCsso).process('{foo:1}').then(function(result) {
            assert.strictEqual(result.css, '');
        });
    });

    it('should process partial inited nodes', function() {
        const emptyGenerator = {
            postcssPlugin: 'emptyGenerator',
            Once(root) {
                const atRule = postcss.atRule({
                    name: 'test'
                });
                const rule = postcss.rule();

                rule.append(postcss.decl());

                root.append(atRule);
                root.append(rule);
            }
        };

        return postcss([
            emptyGenerator,
            postcssCsso
        ]).process('').then(function(result) {
            assert.strictEqual(result.css, '@test;');
        });
    });
});

it('should keep the shape of original postcss nodes', function() {
    const css = '.a { p: 1; } .b { p: 2; }';
    let count = 0;

    const marker = {
        postcssPlugin: 'marker',
        Once(root) {
            root.walkRules(function(node) {
                node.marker = 1;
            });
        }
    };
    const checker = {
        postcssPlugin: 'checker',
        Once(root) {
            root.walkRules(function(node) {
                count += node.marker;
            });
        }
    };

    return postcss([
        marker,
        postcssCsso,
        checker
    ]).process(css).then(function() {
        assert.strictEqual(count, 2);
    });
});

it('error handling', function() {
    return postcss([
        postcssCsso
    ]).process('.test { color: ! }').then(function() {
        assert(false, 'shouldn\'t to be successful');
    }, function(error) {
        assert.strictEqual(error.name, 'SyntaxError');
        assert.strictEqual(error.line, 1);
        assert.strictEqual(error.column, 9);
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
                const plugin = test.options ? postcssCsso(test.options) : postcssCsso;
                return postcss([plugin]).process(test.source).then(function(result) {
                    assert.strictEqual(
                        normalizeNewlines(result.css),
                        normalizeNewlines(test.compressed)
                    );
                });
            });
        }

        const compressTests = require('./node_modules/csso/test/fixture/compress/');
        for (const filename in compressTests) {
            if (!/_[^\/]+\.css/.test(filename)) {
                createCompressTest('node_modules/csso/' + filename, compressTests[filename]);
            }
        }
    });
} catch (e) {
    // should throw exception when no csso fixture found
}
