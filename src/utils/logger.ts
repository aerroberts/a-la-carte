import chalk from "chalk";

export class Logger {
    private prefix?: string;

    constructor(prefix?: string) {
        this.prefix = prefix;
    }

    private formatMessage(color: chalk.ChalkFunction, message: string, ...args: unknown[]): void {
        const prefix = this.prefix ? chalk.gray(`${this.prefix} `) : "";
        console.log(`${prefix}${color(message)}`, ...args);
    }

    log(message: string, ...args: unknown[]): void {
        this.formatMessage(chalk.white, message, ...args);
    }

    warning(message: string, ...args: unknown[]): void {
        this.formatMessage(chalk.yellow, message, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        this.formatMessage(chalk.red, message, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        this.formatMessage(chalk.gray, message, ...args);
    }

    success(message: string, ...args: unknown[]): void {
        this.formatMessage(chalk.green, message, ...args);
    }

    fail(message: string, ...args: unknown[]): void {
        this.formatMessage(chalk.red, message, ...args);
    }
}
