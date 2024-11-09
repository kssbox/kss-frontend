/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  create(context) {
    // eslint-disable-next-line no-unused-vars
    function checkClassDeclaration(node) {
      // 检查类的命名写法并自动修复
      const className = node.id.name;
      const firstLetter = className[0];
      if (firstLetter !== firstLetter.toUpperCase()) {
        context.report({
          node,
          messageId: 'classDeclarationUppercase',
          fix: function (fixer) {
            const correctedClassName = firstLetter.toUpperCase() + className.slice(1);
            return fixer.replaceTextRange(node.id.range, correctedClassName);
          },
        });
      }
    }

    function checkFunctionDeclaration(node) {
      if (node.id.name.startsWith('get')) {
        const blockStatementBody = node.body.body || [];
        const lastNode = blockStatementBody[blockStatementBody.length - 1];
        if (!lastNode || lastNode.type !== "ReturnStatement") {
          context.report({
            node,
            messageId: 'functionDeclarationGet',
          });
        }
      }

      if(node.id.name.startsWith('set')){
        if(!node.params.length){
          context.report({
            node,
            messageId: 'functionDeclarationSet',
          });
        }
      }
    }

    function checkArrowFunctionExpression(node){
      const nodeParent = node.parent;
      if(nodeParent.type !=='VariableDeclarator')return;
      const blockStatementBody = node.body.body || []
      if(nodeParent.id.name.startsWith('get')){
        const lastNode = blockStatementBody[blockStatementBody.length - 1];
        if (!lastNode || lastNode.type !== "ReturnStatement") {
          context.report({
            node,
            messageId: 'functionDeclarationGet',
          });
        }
      }
      if(nodeParent.id.name.startsWith('set')){
        if(!node.params.length){
          context.report({
            node,
            messageId: 'functionDeclarationSet',
          });
        }
      }
    }


    return {
      // ClassDeclaration: checkClassDeclaration,
      FunctionDeclaration: checkFunctionDeclaration,
      ArrowFunctionExpression:checkArrowFunctionExpression
    }
  },
  meta: {
    docs: {
      description: 'naming convention',
      recommended: true
    },
    messages: {
      classDeclarationUppercase: 'Class names should start with an uppercase letter.',
      functionDeclarationGet: '以 get 为前缀声明的函数需要包含返回值.',
      functionDeclarationSet: '以 set 为前缀声明的函数需要包含参数.',
    },
    fixable: 'code',
    schema: [],
    type: 'problem'
  }
}
