import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";

function listPrompts(): void {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
    const promptsDir = join(homeDir, ".a-la-carte", "prompts");

    if (!existsSync(promptsDir)) {
        console.log(chalk.yellow("No prompts directory found. Create one using:"));
        console.log(chalk.whiteBright("  a config add-prompt <name> <content>"));
        return;
    }

    const files = readdirSync(promptsDir);
    const promptFiles = files.filter((file) => file.endsWith(".md"));

    if (promptFiles.length === 0) {
        console.log(chalk.yellow("No prompts found. Add one using:"));
        console.log(chalk.whiteBright("  a config add-prompt <name> <content>"));
        return;
    }

    console.log(chalk.green("Available prompts:"));
    for (const file of promptFiles) {
        const promptName = file.replace(".md", "");
        console.log(chalk.whiteBright(`  ${promptName}`));
    }
}

export const registerListPromptsCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("list-prompts")
        .description("List all available prompts")
        .action(() => {
            listPrompts();
        });
};
