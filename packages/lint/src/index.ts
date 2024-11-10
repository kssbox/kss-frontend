import { fork } from 'child_process';
import path from 'path';

const ESLINT_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];
const STYLELINT_EXTENSIONS = ['css', 'less'];

export interface ILinterOptions  {
  cwd: string;
}

export interface ILintArgs {
  _: string[];
  quiet?: boolean;
  fix?: boolean;
  eslintOnly?: boolean;
  stylelintOnly?: boolean;
  files?: string[];
}

export class BaseLinter {
  linter = '';
  paths: Partial<ILinterOptions> = {};

  constructor({ cwd }: ILinterOptions) {
    this.paths.cwd = cwd;
  }

  getBinPath() {
    try {
      const pkgPath = require.resolve(`${this.linter}/package.json`);
      const pkgContent = require(pkgPath);

      return path.resolve(path.dirname(pkgPath), pkgContent.bin[this.linter]);
    } catch (e) {
      throw new Error(`${this.linter} not found, please install it first.`);
    }
  }

  getRunArgs(args: ILintArgs): string[] {
    // not implemented
    args;
    return [];
  }

  run(args: ILintArgs) {
    const binPath = this.getBinPath();
    const runArgs = this.getRunArgs(args);
    fork(binPath, runArgs).on('exit', (code) => {
      // override exit code when > 0
      if (code) {
        process.exitCode = code;
      }
    });
  }
}

class EsLinter extends BaseLinter {
  linter = 'eslint';

  getRunArgs(args: ILintArgs) {
    // 默认格式化全部
    const { files = [] } = args;
    const exts = files.length ? files : ['./src/', '--ext', ESLINT_EXTENSIONS.map((e) => `.${e}`).join(',')];
    return [...exts, ...(args.quiet ? ['--quiet'] : []), ...(args.fix ? ['--fix'] : []), ...args._];
  }
}

class StyleLinter extends BaseLinter {
  linter = 'stylelint';

  getRunArgs(args: ILintArgs) {
    // 默认格式化全部
    const { files = [] } = args;
    const exts = files.length ? files : [`src/**/*.{${STYLELINT_EXTENSIONS.join(',')}}`];
    return [
      ...exts,
      '--custom-syntax',
      'postcss-less',
      '--config-basedir',
      this.paths.cwd!,
      ...(args.quiet ? ['--quiet'] : []),
      '--allow-empty-input',
      ...(args.fix ? ['--fix'] : []),
      ...args._
    ];
  }
}

export default (opts: ILinterOptions, args: ILintArgs) => {
  if (!args.eslintOnly) {
    const stylelint = new StyleLinter(opts);
    const styleArgs = { ...args, _: [...args._] };

    for (const suffix of ESLINT_EXTENSIONS.map((e) => `**/*${e}`)) {
      styleArgs._.unshift('--ignore-pattern', suffix);
    }

    stylelint.run(styleArgs);
  }

  if (!args.stylelintOnly) {
    const eslint = new EsLinter(opts);
    const esArgs = { ...args, _: [...args._] };

    for (const suffix of STYLELINT_EXTENSIONS.map((e) => `**/*.${e}`)) {
      esArgs._.unshift('--ignore-pattern', suffix);
    }

    eslint.run(esArgs);
  }
};
