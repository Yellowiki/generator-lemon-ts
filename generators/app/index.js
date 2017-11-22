const Generator = require('yeoman-generator');
const chalk = require('chalk');
const fs = require('fs-extra');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    this.log(yosay('Welcome to the gnarly ' + chalk.red('lemon-ts') + ' generator!'));

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Project name'
      },
      {
        type: 'list',
        name: 'type',
        message: 'What kind?',
        choices: [
          {
            name: 'CLI app',
            value: 'cli'
          },
          {
            name: 'Imported module',
            value: 'module'
          }
        ]
      },
      {
        type: 'input',
        name: 'repository',
        message: "Repository URL (type 'none' for none)",
        validate: input => {
          if (input) {
            if (input.match(/^https:\/\/github\.com\/[a-zA-Z0-9_\-/]+\.git$/)) {
              return true;
            }
            return "Either type 'none' or provide a valid GitHub HTTPS clone URL";
          }
          return true;
        },
        filter: input => (input === 'none' ? undefined : input)
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  async writing() {
    await fs.copy(this.templatePath(), this.destinationPath());
    const pkg = {
      name: this.props.name,
      version: '0.0.0-development',
      bin: 'dist/index.js',
      license: 'MIT',
      typings: 'dist/index.d.ts',
      prettier: {
        singleQuote: true,
        trailingComma: 'all',
        semi: false
      },
      scripts: {
        format: 'prettier *.json --write && npm run -s lint --fix',
        watch: 'tsc --pretty --watch',
        lint: 'tslint --project tsconfig.json --format codeFrame',
        prepare: 'run-s -s format lint build',
        build: 'tsc --pretty',
        'semantic-release': 'semantic-release pre && npm publish && semantic-release post'
      },
      devDependencies: {
        'npm-run-all': '^4.1.2',
        'pre-commit': '^1.2.2',
        prettier: '^1.8.2',
        'semantic-release': '^8.2.0',
        tslint: '^5.8.0',
        'tslint-config-lemon': '^1.1.1',
        'tslint-language-service': '^0.9.6',
        typescript: '^2.6.1',
        'ts-jest': '^21.2.3',
        jest: '^21.2.1'
      },
      precommit: 'prepare',
      files: ['dist'],
      main: 'dist/index.js',
      dependencies: {
        '@types/node': '>= 8.0.53'
      },
      repository: {
        type: 'git',
        url: this.props.repository
      },
      jest: {
        transform: {
          '^.+\\.ts$': 'ts-jest'
        },
        testRegex: '/__tests__/.+\\.ts$',
        moduleFileExtensions: ['ts'],
        mapCoverage: true
      }
    };
    pkg.name = this.props.name;
    if (this.props.type === 'cli') {
      pkg.bin = 'dist/index.js';
      pkg.scripts.build = 'tsc --pretty && chmod +x dist/index.js';
    }
    if (this.props.type === 'module') {
      pkg.main = 'dist/index.js';
      pkg.scripts.build = 'tsc --pretty';
    }
    await fs.ensureFile(this.destinationPath('src/index.ts'));
    await fs.ensureFile(this.destinationPath('__tests__/index.test.ts'));
    await fs.writeJSON(this.destinationPath('package.json'), pkg, { spaces: 2 });
  }

  install() {
    if (this.props.repository) {
      this.log(
        yosay(
          'Run ' +
            chalk.red('semantic-release-cli setup') +
            ' to initialize semantic release'
        )
      );
    }
    this.yarnInstall();
  }
};
