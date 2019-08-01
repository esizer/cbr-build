#!/usr/bin/env node
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const meow = require('meow');
const chalk = require('chalk');
const cbr = require('../scripts/index');

const cli = meow(
  `
	${chalk.green.bold('Usage')}
		${chalk.dim('$')} ${chalk.magenta('cbr-scripts')} ${chalk.white('script')}

	${chalk.green.bold('Options')}
		${chalk.magenta('--name, -n')}	${chalk.white('Plugin name slug')}
		${chalk.magenta('--config, -c')}	${chalk.white('Webpack config file')}
`,
  {
    flags: {
      name: {
        type: 'string',
        alias: 'n',
      },
      config: {
        type: 'string',
        alias: 'c',
      },
    },
  }
);

cbr(cli.input[0], cli.flags);
