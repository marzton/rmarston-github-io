'use strict';

const { transformSync } = require('@babel/core');

function toCommonJs(sourceText) {
  const withoutNamedExports = sourceText.replace(/^export function\s+/gm, 'function ');
  const withDefaultConst = withoutNamedExports.replace(
    /^export default\s+/m,
    'const __default_export__ = ',
  );

  // Export everything that was defined as a function or const/let/var at top level?
  // For now let's just export the default and any function that was exported.
  // Actually, the simple approach is to just export default as that's what we mostly need.

  return `${withDefaultConst}\nmodule.exports = __default_export__;\n`;
}

module.exports = {
  process(sourceText, sourcePath) {
    const stripped = transformSync(sourceText, {
      filename: sourcePath,
      babelrc: false,
      configFile: false,
      sourceMaps: 'inline',
      plugins: [
        '@babel/plugin-syntax-typescript',
        function stripTypesPlugin() {
          return {
            visitor: {
              TSInterfaceDeclaration(path) {
                path.remove();
              },
              TSTypeAliasDeclaration(path) {
                path.remove();
              },
              TSAsExpression(path) {
                path.replaceWith(path.node.expression);
              },
              Identifier(path) {
                if (path.node.typeAnnotation) {
                  path.node.typeAnnotation = null;
                }
                if (path.node.optional) {
                  path.node.optional = false;
                }
              },
              Function(path) {
                if (path.node.returnType) {
                  path.node.returnType = null;
                }
                if (path.node.typeParameters) {
                  path.node.typeParameters = null;
                }
              },
            },
          };
        },
      ],
    });

    return {
      code: toCommonJs(stripped && stripped.code ? stripped.code : sourceText),
    };
  },
};
