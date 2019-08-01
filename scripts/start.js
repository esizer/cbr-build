'use strict';

const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const webpack = require('webpack');

const clearConsole = require('./utils/clearConsole');
const formatWebpackMessages = require('./utils/formatWebpackMessages');

async function start(flags) {
  //Set the environment to production
  process.env.BABEL_ENV = 'development';
  process.env.NODE_ENV = 'development';

  const cwd = process.cwd();
  const config = require(path.resolve(cwd, flags.config));
  const compiler = await webpack(config);
  const spinner = new ora({
    text: ` ${chalk.yellow('Watching for changes...')}\n`,
    spinner: 'bouncingBall',
    color: 'magenta',
    prefixText: '👀  ',
  });

  clearConsole();
  console.log(`🚗  ${chalk.blueBright('Starting up watch script...')}`);

  compiler.watch({}, (err, stats) => {
    let messages;
    if (err) {
      if (!err.message) {
        return console.log(err);
      }
      messages = formatWebpackMessages({
        errors: [err.message],
        warnings: [],
      });
    } else {
      messages = formatWebpackMessages(
        stats.toJson({ all: false, warnings: true, errors: true })
      );
    }
    if (messages.errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }

      clearConsole();

      console.log(`🤮  ${chalk.black.bgRed('Error dump incoming.')}`);
      const errors = console.log(`💀  ${messages.errors.join('\n\n')}`);
      spinner.start();
      return errors;
    }

    if (
      process.env.CI &&
      (typeof process.env.CI !== 'string' ||
        process.env.CI.toLowerCase() !== 'false') &&
      messages.warnings.length
    ) {
      console.log(
        chalk.yellow(
          '\nTreating warnings as errors because process.env.CI = true.\n' +
            'Most CI servers set it automatically.\n'
        )
      );
      return console.log(messages.warnings.join('\n\n'));
    }

    console.log(`📦  ${chalk.green('Scripts built and packaged!\n')}`);
    return spinner.start();
  });
}

module.exports = start;
