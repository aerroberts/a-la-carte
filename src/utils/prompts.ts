import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";

export function loadPrompts(promptNames: string[]): string[] {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
    const promptsDir = join(homeDir, ".a-la-carte", "prompts");

    const loadedPrompts: string[] = [];

    for (const promptName of promptNames) {
        const filename = `${promptName}.md`;
        const filePath = join(promptsDir, filename);

        if (!existsSync(filePath)) {
            console.log(chalk.yellow(`Warning: Prompt "${promptName}" not found at ${filePath}`));
            console.log(chalk.gray("Use 'a steering list-prompts' to see available prompts"));
            continue;
        }

        try {
            const content = readFileSync(filePath, "utf-8");
            loadedPrompts.push(content);
            console.log(chalk.gray(`Loaded prompt: ${chalk.whiteBright(promptName)}`));
        } catch (error) {
            console.log(chalk.red(`Error loading prompt "${promptName}": ${error}`));
        }
    }

    return loadedPrompts;
}

export function combinePromptsWithMessage(prompts: string[], message: string): string {
    if (prompts.length === 0) {
        return message;
    }

    const promptSection = prompts.join("\n\n---\n\n");
    return `${promptSection}\n\n---\n\n<request> ${message} </request>`;
}
