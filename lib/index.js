import { syntax } from 'csso';
import postcssToCsso from './postcssToCsso.js';
import cssoToPostcss from './cssoToPostcss.js';

export default Object.assign((options = {}) => ({
    postcssPlugin: 'postcss-csso',
    OnceExit(root, { result, postcss }) {
        const cssoAst = postcssToCsso(root);
        const compressedAst = syntax.compress(cssoAst, options).ast;

        result.root = cssoToPostcss(compressedAst, postcss);
    }
}), { postcss: true });
