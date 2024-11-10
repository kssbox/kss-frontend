module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],

    'body-empty': [2, 'always'],
    'footer-empty': [2, 'always'],

    'type-enum': [2, 'always', ['feat', 'ci', 'fix', 'perf', 'docs', 'style', 'refactor', 'test', 'chore']]
  },
  prompt: {
    questions: {
      type: {
        description: '<类型>（必需）选择您要提交的更改类型：',
        enum: {
          feat: {
            description: '新功能'
          },
          ci: {
            description: 'ci 相关功能'
          },
          fix: {
            description: '修复 bug'
          },
          perf: {
            description: '性能优化方面的代码'
          },
          docs: {
            description: '单纯的文档内容的改动'
          },
          style: {
            description: '不影响代码含义或功能的修改（比如代码格式等）'
          },
          refactor: {
            description: '既不是 bug 修复也不是功能添加的代码，如：重构'
          },
          test: {
            description: '测试补全'
          },
          chore: {
            description: '杂项，比如代码构建流程、辅助工具等的修改'
          }
        }
      },
      scope: {
        description: '<范围>（必需）此更改的范围是什么（例如组件或文件名）。'
      },
      subject: {
        description: '<主题>（必需）为变更写一个简短的、命令式的时态描述。'
      },
      body: {
        description: '<正文>（可选）正文部分写这次改动的动机。（可选）'
      },
      footer: {
        description: '<注脚>（可选）。如果有需要，注脚应该包含关于「不兼容改动（Breaking Changes）」的信息，另外也可作为 hook 功能。'
      }
    }
  }
};
