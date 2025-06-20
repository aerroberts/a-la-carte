import chalk from "chalk";

function formatMessage(color: chalk.ChalkFunction, message: string, ...args: unknown[]): void {
    console.log(`${color(message)}`, ...args);
}

export const Log = {
    info(message: string, ...args: unknown[]): void {
        formatMessage(chalk.cyan, `${message}`, ...args);
    },

    log(message: string, ...args: unknown[]): void {
        formatMessage(chalk.gray, `    ${message}`, ...args);
    },

    warning(message: string, ...args: unknown[]): void {
        formatMessage(chalk.yellow, `    ? ${message}`, ...args);
    },

    error(message: string, ...args: unknown[]): never {
        formatMessage(chalk.red, `✘ ${message}`, ...args);
        process.exit(1);
    },

    success(message: string, ...args: unknown[]): void {
        formatMessage(chalk.green, `✔ ${message}`, ...args);
    },

    fail(message: string, ...args: unknown[]): void {
        formatMessage(chalk.red, `✘ ${message}`, ...args);
    },
};
