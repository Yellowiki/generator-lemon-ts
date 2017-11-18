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
        lint: 'tslint --project tsconfig.json',
        prepare: 'run-s -s format lint build'
      },
      devDependencies: {
        'npm-run-all': '^4.1.2',
        'pre-commit': '^1.2.2',
        prettier: '^1.8.2',
        'semantic-release': '^8.2.0',
        tslint: '^5.8.0',
        'tslint-config-airbnb': '^5.3.1',
        'tslint-config-prettier': '^1.6.0',
        'tslint-plugin-prettier': '^1.3.0',
        typescript: '^2.6.1'
      },
      dependencies: {
        '@types/node': '>= 8.0.53'
      },
      precommit: 'prepare',
      files: ['dist']
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
    await fs.writeJSON(this.destinationPath('package.json'), pkg, { spaces: 2 });
  }

  install() {
    this.yarnInstall();
  }
};
