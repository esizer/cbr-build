'use strict';

const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const webpack = require('webpack');

const clearConsole = require('./utils/clearConsole');
const formatWebpackMessages = require('./utils/formatWebpackMessages');

async function build(flags) {
  const cwd = process.cwd();
  const config = require(path.resolve(cwd, flags.config));
  const compiler = await webpack(config);
  const spinner = new ora({
    text: ` ${chalk.yellow('Creating production build...')}\n`,
    spinner: 'bouncingBall',
    color: 'magenta',
    prefixText: '🔧 ',
  });

  clearConsole();
  console.log(`🚗  ${chalk.blueBright('Starting up build script...')}`);

  spinner.start();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          console.log(err);
          return reject(err);
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
        console.log(`🤮  ${chalk.black.bgRed('Error dump incoming.')}`);
        console.log(`💀  ${messages.errors.join('\n\n')}`);
        return reject(new Error(messages.errors.join('\n\n')));
      }
      // CI.
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
        console.log(messages.warnings.join('\n\n'));
        return reject(new Error(messages.warnings.join('\n\n')));
      }

      spinner.succeed(`${chalk.green('📦  Scripts built and packaged!')}`);
      return resolve({
        stats,
        warnings: messages.warnings,
      });
    });
  });
}

module.exports = build;
