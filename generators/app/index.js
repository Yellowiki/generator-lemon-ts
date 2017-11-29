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
      name: 'fast-brainfuck',
      version: '0.0.0-development',
      description: 'fast-brainfuck',
      license: 'MIT',
      files: ['dist'],
      main: 'dist/index.js',
      typings: 'dist/index.d.ts',
      scripts: {
        clean: 'rimraf dist && rimraf coverage',
        format: 'prettier *.json --write && yarn lint --format',
        lint: 'tslint --project tsconfig.json --format codeFrame',
        prepare: 'yarn build && yarn test',
        pretest: 'yarn lint',
        prebuild: 'yarn clean && yarn format',
        build: 'tsc --pretty',
        test: 'jest --coverage',
        watch: 'yarn build --watch',
        'watch:test': 'jest --watch'
      },
      devDependencies: {
        '@types/jest': '^21.1.8',
        '@types/node': '^8.0.0',
        jest: '^21.2.1',
        'jest-environment-node-debug': '^2.0.0',
        'pre-commit': '^1.2.2',
        prettier: '^1.5.2',
        rimraf: '^2.0.0',
        'ts-jest': '^21.2.3',
        'ts-node': '^3.2.0',
        tslint: '^5.0.0',
        'tslint-config-lemon': '^1.1.3',
        typescript: '^2.3.0'
      },
      engines: {
        node: '>=8.0.0'
      },
      jest: {
        transform: {
          '.(ts)': 'ts-jest'
        },
        testRegex: '/__tests__/.*\\.test\\.ts$',
        moduleFileExtensions: ['ts', 'js'],
        testEnvironment: 'node',
        mapCoverage: true
      },
      precommit: 'prepare'
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
    await fs.ensureFile(this.destinationPath('src/__tests__/index.test.ts'));
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
