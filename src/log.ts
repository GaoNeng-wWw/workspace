import chalk from "chalk";

export const info = (msg) => console.log(chalk.bold('[INFO]'), chalk.bold(msg));
export const error = (msg: any, stack?: any) => console.log(chalk.red('[ERR]'), chalk.red(msg), stack ? chalk.red(stack) : '');