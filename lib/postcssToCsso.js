var parse = require('csso').parse;

function isDecl(node) {
    return node.type === 'decl';
}

function appendNodes(cssoNode, postcssNode) {
    cssoNode.push.apply(cssoNode, postcssNode.nodes.map(postcssToCsso));
    return cssoNode;
}

function postcssToCsso(node) {
    function parseToCsso(str, scope, node) {
        var cssoNode = parse(str, scope, {
            needInfo: true
        });

        cssoNode[0] = getInfo(node);

        return cssoNode;
    }

    function getInfo(node) {
        return {
            postcssNode: node
        };
    }

    switch (node.type) {
        case 'root':
            return appendNodes([getInfo(node), 'stylesheet'], node);

        case 'rule':
            return [
                getInfo(node),
                'ruleset',
                node.selector ? parseToCsso(node.selector, 'selector', node) : [getInfo(node), 'selector'],
                appendNodes([{}, 'block'], node)
            ];

        case 'atrule':
            var atruleStr = '@' + node.name + ' ' + node.params;

            if (node.nodes) {
                if (node.nodes.some(isDecl)) {
                    atruleStr += '{}';
                } else {
                    atruleStr += '{a{}}';
                }
            }

            var cssoNode = parseToCsso(atruleStr, 'atruler', node);

            if (node.nodes) {
                appendNodes(cssoNode[cssoNode.length - 1], node);
            }

            return cssoNode;

        case 'decl':
            return parseToCsso(
                (node.raws.before || '').trimLeft() +
                node.prop + ':' + node.value +
                (node.important ? '!important' : ''),
                'declaration',
                node
            );

        case 'comment':
            return [
                getInfo(node),
                'comment',
                node.raws.left + node.text + node.raws.right
            ];
    }
}

module.exports = postcssToCsso;
