import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { bash } from "../../utils/bash";

export interface OpenConfigArgs {}

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

export async function openConfigCommand(_: OpenConfigArgs): Promise<void> {
    await openConfig();
}
