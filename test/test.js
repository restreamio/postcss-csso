import assert, { strictEqual } from 'assert';
import postcss from 'postcss';
import postcssNested from 'postcss-nested';
import postcssCsso from 'postcss-csso';
import { createRequire } from 'module';

describe('can be used as a postcss plugin', () => {
    const css = '.a { color: #ff0000; } @media all { .b { color: rgba(255, 0, 0, 1) } }';
    const minified = '.a{color:red}@media all{.b{color:red}}';

    it('via .use()', () =>
        postcss().use(postcssCsso())
            .process(css)
            .then(result =>
                strictEqual(result.css, minified)
            )
    );

    it('via postcss([..]) w/o config', () =>
        postcss([postcssCsso])
            .process(css)
            .then(result =>
                strictEqual(result.css, minified)
            )
    );

    it('via postcss([..]) w/ config', () =>
        postcss([postcssCsso({})])
            .process(css)
            .then(result =>
                strictEqual(result.css, minified)
            )
    );
});

describe('should accept options for compress', () => {
    const css = '.a { color: #ff0000; } .b { color: rgba(255, 0, 0, 1) }';
    const minified = '.a,.b{color:red}';
    const minifiedNoRestructure = '.a{color:red}.b{color:red}';

    it('restruture on', () =>
        postcss()
            .use(postcssCsso({ restructure: true }))
            .process(css)
            .then(result =>
                strictEqual(result.css, minified)
            )
    );

    it('restruture off', () =>
        postcss()
            .use(postcssCsso({ restructure: false }))
            .process(css)
            .then(result =>
                strictEqual(result.css, minifiedNoRestructure)
            )
    );
});

describe('edge cases', () => {
    it('should process empty', () =>
        postcss()
            .use(postcssCsso)
            .process('')
            .then(result =>
                strictEqual(result.css, '')
            )
    );

    it('should process block with no selector', () =>
        postcss()
            .use(postcssCsso)
            .process('{foo:1}')
            .then(result =>
                strictEqual(result.css, '')
            )
    );

    it('should process partial inited nodes', () => {
        const emptyGenerator = {
            postcssPlugin: 'emptyGenerator',
            Once(root) {
                const atRule = postcss.atRule({ name: 'atrule' });
                const rule = postcss.rule();

                root.append(atRule);
                root.append(rule);
                rule.append(postcss.decl({ prop: 'prop' }));
            }
        };

        return postcss([
            emptyGenerator,
            postcssCsso
        ]).process('').then(result =>
            strictEqual(result.css, '@atrule;')
        );
    });
});

it('should keep shape of original postcss nodes', () => {
    const css = '.a { p: 1; } .b { p: 2; }';
    let count = 0;

    const marker = {
        postcssPlugin: 'marker',
        Once(root) {
            root.walkRules(node => {
                node.marker = 1;
            });
        }
    };
    const checker = {
        postcssPlugin: 'checker',
        Once(root) {
            root.walkRules(node => {
                count += node.marker;
            });
        }
    };

    return postcss([
        marker,
        postcssCsso,
        checker
    ]).process(css).then(() =>
        strictEqual(count, 2)
    );
});

it('error handling', () =>
    assert.rejects(
        postcss([postcssCsso])
            .process('.test { color }'),
        {
            name: 'CssSyntaxError',
            line: 1,
            column: 9
        }
    )
);

it('should work with postcss-nested (issue #19)', () =>
    postcss([
        postcssNested,
        postcssCsso
    ])
        .process('.c { .touch &:hover { color: #ff0000; } }')
        .then(result =>
            strictEqual(result.css, '.touch .c:hover{color:red}')
        )
);

// currently works only is used as linked package
// TODO: find the way to use csso compress tests
try {
    describe('should pass csso compress tests', () => {
        function normalizeNewlines(str) {
            return str.replace(/\r/g, '');
        }

        const require = createRequire(import.meta.url);

        const compressTests = require('../node_modules/csso/cjs-test/fixture/compress.cjs');
        for (const [filename, test] of Object.entries(compressTests)) {
            if (!/_[^\/]+\.css/.test(filename)) {
                it('node_modules/csso/' + filename, () => {
                    const plugin = test.options ? postcssCsso(test.options) : postcssCsso;

                    return postcss([plugin]).process(test.source).then(function(result) {
                        strictEqual(
                            normalizeNewlines(result.css),
                            normalizeNewlines(test.compressed)
                        );
                    });
                });
            }
        }
    });
} catch (e) {
    // should throw exception when no csso fixture found
}
