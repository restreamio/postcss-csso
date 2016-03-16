var parse = require('csso').parse;
var stringify = require('csso').stringify;

function isDecl(node) {
    return node.type === 'decl';
}

function appendNodes(cssoNode, postcssNode) {
    cssoNode.push.apply(cssoNode, postcssNode.nodes.map(walk));
    return cssoNode;
}

function walk(node) {
    function parseToCsso(str, scope, node) {
        var cssoNode = parse(str, scope, {
            needInfo: true
        });

        cssoNode[0] = getInfo(node);

        return cssoNode;
    }

    function getInfo(node) {
        var filename = node.source.input.file || node.source.input.id;

        return {
            source: filename,
            line: node.source.start.line,
            column: node.source.start.column,
            postcssNode: node
        };
    }

    switch (node.type) {
        case 'root':
            return appendNodes([getInfo(node), 'stylesheet'], node);

        case 'rule':
            return [getInfo(node), 'ruleset',
                parseToCsso(node.selector, 'selector', node),
                appendNodes([{}, 'block'], node)
            ];

        case 'atrule':
            var atruleStr = '@' + node.name +
                (node.raws.afterName || ' ') +
                node.params +
                (node.raws.between || '');

            if (node.nodes) {
                if (node.nodes.some(isDecl)) {
                    atruleStr += '{}';
                } else {
                    atruleStr += '{a{}}';
                }
            }

            var cssoNode = parseToCsso(
                atruleStr,
                'atruler',
                node
            );


            if (node.nodes) {
                appendNodes(cssoNode[cssoNode.length - 1], node);
            }

            return cssoNode;

        case 'decl':
            return parseToCsso(
                (node.raws.before || '').trimLeft() +
                node.prop +
                (node.raws.between || ':') +
                node.value,
                'declaration',
                node
            );

        case 'comment':
            return [getInfo(node), 'comment', node.text];
    }
}

module.exports = function postcssToCsso(node) {
    return walk(node);
}
