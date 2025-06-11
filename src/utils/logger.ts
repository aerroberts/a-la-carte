import chalk from "chalk";

export const Log = {
    formatMessage(color: chalk.ChalkFunction, message: string, ...args: unknown[]): void {
        console.log(`${color(message)}`, ...args);
    },

    log(message: string, ...args: unknown[]): void {
        Log.formatMessage(chalk.white, message, ...args);
    },

    warning(message: string, ...args: unknown[]): void {
        Log.formatMessage(chalk.yellow, message, ...args);
    },

    error(message: string, ...args: unknown[]): void {
        Log.formatMessage(chalk.red, message, ...args);
    },

    debug(message: string, ...args: unknown[]): void {
        Log.formatMessage(chalk.gray, message, ...args);
    },

    success(message: string, ...args: unknown[]): void {
        Log.formatMessage(chalk.green, message, ...args);
    },

    fail(message: string, ...args: unknown[]): void {
        Log.formatMessage(chalk.red, message, ...args);
    },
};
