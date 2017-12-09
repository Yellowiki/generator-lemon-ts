const Generator = require('yeoman-generator');
const chalk = require('chalk');
const fs = require('fs-extra');
const yosay = require('yosay');
const deepAssign = require('deep-assign');

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
            name: 'CLI/server app',
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
    const pkg = deepAssign(await fs.readJSON(this.templatePath('package.json')), {
      name: this.props.name,
      description: this.props.name,
      repository: {
        type: 'git',
        url: this.props.repository
      }
    });
    if (this.props.type === 'cli') {
      pkg.bin = 'dist/index.js';
      pkg.scripts.build = 'tsc --pretty && chmod +x dist/index.js';
      pkg.scripts.start = 'ts-node src/index.ts';
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
