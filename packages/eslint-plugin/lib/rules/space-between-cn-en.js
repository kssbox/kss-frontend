/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
    name: 'space-between-cn-en',
    meta: {
        type: 'layout',
        docs: {
            description: '中文与英文或数字之间需要加空格',
            category: 'Stylistic Issues',
            recommended: true,
        },
        messages: {
            errorMessage: '中文与英文或数字之间需要加空格'
        },
        schema: [],
        fixable: 'whitespace',
    },
    create: function (context) {
        function checkLiteralSpaceBetweenCnEn(node) {
            if (typeof node.value !== 'string') return;
            var value = node.raw.trim()
            if (!value) return;
            var text = node.raw
            if (text.match(/[\u4e00-\u9fa5][a-zA-Z0-9]/) || text.match(/[a-zA-Z0-9][\u4e00-\u9fa5]/)) {
                context.report({
                    node: node,
                    messageId: 'errorMessage',
                    fix: function (fixer) {
                        var newText = node.raw.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2').replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');
                        return fixer.replaceText(node, newText);
                    },
                });
            }
        }
        function checkTemplateElementSpaceBetweenCnEn(node) {
            var value = node.value.raw.trim()
            if (typeof value !== 'string') return;
            var text = node.value.raw
            if (text.match(/[\u4e00-\u9fa5][a-zA-Z0-9]/) || text.match(/[a-zA-Z0-9][\u4e00-\u9fa5]/)) {
                var quasis = node.parent.quasis;
                var qLength = quasis.length;
                context.report({
                    node: node,
                    messageId: 'errorMessage',
                    fix: function (fixer) {
                        var newText = text.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2').replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');
                        if(qLength === 1){
                            return fixer.replaceText(node, newText);    
                        }
                        var index = quasis.findIndex(item=>item===node);
                        if(index === 0){
                            return fixer.replaceText(node, `\`${newText}\${`);
                        }
                        if(index === qLength - 1){
                            return fixer.replaceText(node, `}${newText}\``);
                        }
                        return fixer.replaceText(node, `}${newText}\${`);
                    },
                });
            }
        }

        return {
            Literal: checkLiteralSpaceBetweenCnEn,
            TemplateElement: checkTemplateElementSpaceBetweenCnEn,
        };
    },
};



return {

};