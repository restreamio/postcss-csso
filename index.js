var postcss = require('postcss');
var csso = require('csso');
 
var postcssCsso = postcss.plugin('postcss-csso', function postcssCsso(options) {
    return function (root) {
        var minified = csso.minify(root.toString(), options);
        
        root.nodes = postcss
            .parse(minified)
            .nodes
            .map(function(node) {
                node.parent = root;
                return node;
            });
    }
});

postcssCsso.process = function(css, options) {
    return postcss([postcssCsso(options)]).process(css);
};

module.exports = postcssCsso;
