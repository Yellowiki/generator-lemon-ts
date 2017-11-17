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
    const pkg = await fs.readJSON(this.templatePath('package.json'));
    pkg.name = this.props.name;
    if (this.props.type === 'cli') {
      pkg.bin = 'dist/index.js';
    }
    if (this.props.type === 'module') {
      pkg.main = 'dist/index.js';
    }
    await fs.ensureFile(this.destinationPath('src/index.ts'));
    await fs.writeJSON(this.destinationPath('package.json'), pkg, { spaces: 2 });
  }

  install() {
    this.yarnInstall();
  }
};
