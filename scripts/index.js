'use strict';

const chalk = require('chalk');

const build = require('./build');
const start = require('./start');

async function cbr(script, flags) {
	let result;
  switch (script) {
    case 'build':
      result = await build(flags);
      process.exit(result.status);
      break;
    case 'start':
      //Set the environment to development
      process.env.BABEL_ENV = 'development';
      process.env.NODE_ENV = 'development';
      start(flags);
      break;
    default:
      console.log(`😿  Unkown script "${chalk.magenta(script)}".`);
  }
}

module.exports = cbr;
