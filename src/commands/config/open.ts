import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";

export class ConfigOpenCommand implements CommandRegistration {
    name = "open";
    description = "Opens the config metadata directory (prompts) in the file system";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .action(async () => {
                await this.openMetadataDirectory();
            });
    }

    private async openMetadataDirectory(): Promise<void> {
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const promptsDir = join(homeDir, ".a-la-carte", "prompts");

        // Ensure the prompts directory exists
        if (!existsSync(promptsDir)) {
            mkdirSync(promptsDir, { recursive: true });
            console.log(chalk.green(`Created prompts directory: ${chalk.whiteBright(promptsDir)}`));
        }

        // Open the directory in the default file manager
        await bash(`open "${promptsDir}"`);
        console.log(chalk.green(`Opened config metadata directory: ${chalk.whiteBright(promptsDir)}`));
    }
}
