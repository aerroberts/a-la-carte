import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { bash } from "../../utils/bash";

async function openConfig(): Promise<void> {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
    const configDir = join(homeDir, ".a-la-carte");
    const configFile = join(configDir, "config.json");

    // Ensure the config directory exists
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
        console.log(chalk.green(`Created config directory: ${chalk.whiteBright(configDir)}`));
    }

    // Ensure the config file exists
    if (!existsSync(configFile)) {
        writeFileSync(configFile, "{}", "utf-8");
        console.log(chalk.green(`Created config file: ${chalk.whiteBright(configFile)}`));
    }

    // Open the config file with the default editor
    try {
        const editor = process.env.EDITOR || "code";
        await bash(`${editor} "${configFile}"`);
        console.log(chalk.green("Opened configuration file"));
    } catch (error) {
        console.log(chalk.red("Error opening config file:"));
        console.log(error);
        console.log(chalk.yellow(`You can manually edit the config file at: ${configFile}`));
    }
}

export const registerOpenCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("open")
        .description("Open the configuration file in your default editor")
        .action(async () => {
            await openConfig();
        });
};
