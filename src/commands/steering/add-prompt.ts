import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";

export class SteeringAddPromptCommand implements CommandRegistration {
    name = "add-prompt";
    description = "Adds a new prompt with the specified name and content";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<name>", "The name of the prompt")
            .argument("<content>", "The content/text of the prompt")
            .action(async (name: string, content: string) => {
                await this.addPrompt(name, content);
            });
    }

    private async addPrompt(name: string, content: string): Promise<void> {
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const promptsDir = join(homeDir, ".a-la-carte", "prompts");

        // Ensure the prompts directory exists
        if (!existsSync(promptsDir)) {
            mkdirSync(promptsDir, { recursive: true });
            console.log(chalk.green(`Created prompts directory: ${chalk.whiteBright(promptsDir)}`));
        }

        // Sanitize the name to be filesystem-safe
        const sanitizedName = name.replace(/[^a-zA-Z0-9-]/g, "").trim();
        if (!sanitizedName) {
            console.log(
                chalk.red(
                    "Error: Invalid prompt name. Please use only alphanumeric characters, spaces, hyphens, and underscores."
                )
            );
            return;
        }

        const filename = `${sanitizedName}.md`;
        const filePath = join(promptsDir, filename);

        // Check if prompt already exists
        if (existsSync(filePath)) {
            console.log(chalk.yellow(`Prompt "${sanitizedName}" already exists. Overwriting...`));
        }

        // Write the prompt content to the markdown file
        writeFileSync(filePath, content, "utf-8");

        console.log(chalk.green(`Successfully added prompt: ${chalk.whiteBright(sanitizedName)}`));
        console.log(chalk.gray(`File saved to: ${filePath}`));
    }
}
