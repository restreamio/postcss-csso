var postcss = require('postcss');
var translate = require('csso').internal.translate;

var DEFAULT_RAWS = {
    before: '',
    after: '',
    between: ''
};
var DECL_RAWS = {
    before: '',
    after: '',
    between: ':'
};

module.exports = function cssoToPostcss(node) {
    var postcssNode = node.info ? node.info.postcssNode : null;

    switch (node.type) {
        case 'StyleSheet':
            if (!postcssNode) {
                postcssNode = postcss.root();
            }

            postcssNode.nodes = node.rules.map(cssoToPostcss);

            return postcssNode;

        case 'Atrule':
            var children = node.block ? node.block.rules || node.block.declarations : undefined;

            if (!postcssNode) {
                postcssNode = postcss.atRule();
            }

            postcssNode.raws = DEFAULT_RAWS;
            postcssNode.name = node.name;
            postcssNode.params = translate(node.expression);
            postcssNode.nodes = children && children.map(cssoToPostcss);

            return postcssNode;

        case 'Ruleset':
            if (!postcssNode) {
                postcssNode = postcss.rule();
            }

            postcssNode.raws = DEFAULT_RAWS;
            postcssNode.selector = translate(node.selector);
            postcssNode.nodes = node.block.declarations.map(cssoToPostcss);

            return postcssNode;

        case 'Declaration':
            if (!postcssNode) {
                postcssNode = postcss.decl();
            }

            postcssNode.raws = DECL_RAWS;
            postcssNode.prop = translate(node.property);
            postcssNode.value = translate(node.value);
            
            return postcssNode;

        case 'Comment':
            if (!postcssNode) {
                postcssNode = postcss.comment({
                    raws: DEFAULT_RAWS,
                    text: node.value
                });
            }

            return postcssNode;
    }
};
