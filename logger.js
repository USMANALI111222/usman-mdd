const chalk = require("chalk");

const logger = {
  info: (msg, ...args) => {
    console.log(chalk.cyan(`[INFO] ${msg}`), ...args);
  },
  warn: (msg, ...args) => {
    console.log(chalk.yellow(`[WARN] ${msg}`), ...args);
  },
  error: (msg, ...args) => {
    console.log(chalk.red(`[ERROR] ${msg}`), ...args);
  },
  success: (msg, ...args) => {
    console.log(chalk.green(`[SUCCESS] ${msg}`), ...args);
  },
};

module.exports = logger;
