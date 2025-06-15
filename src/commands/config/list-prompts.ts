import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";

export class ConfigListPromptsCommand implements CommandRegistration {
    name = "list-prompts";
    description = "Lists all available prompts";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .action(async () => {
                await this.listPrompts();
            });
    }

    private async listPrompts(): Promise<void> {
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const promptsDir = join(homeDir, ".a-la-carte", "prompts");

        if (!existsSync(promptsDir)) {
            console.log(
                chalk.yellow("No prompts directory found. Use 'a config add-prompt' to create your first prompt.")
            );
            return;
        }

        const files = readdirSync(promptsDir);
        const markdownFiles = files.filter((file) => file.endsWith(".md"));

        if (markdownFiles.length === 0) {
            console.log(chalk.yellow("No prompts found. Use 'a config add-prompt' to create your first prompt."));
            return;
        }

        console.log(chalk.green("Available prompts:"));
        for (const file of markdownFiles) {
            const promptName = file.replace(".md", "");
            console.log(chalk.whiteBright(`  • ${promptName}`));
        }
        console.log(chalk.gray(`\nPrompts stored in: ${promptsDir}`));
    }
}
