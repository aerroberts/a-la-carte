import { existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { bash } from "../../utils/bash";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";

function collectPrompts(value: string, previous: string[]): string[] {
    return previous.concat([value]);
}

async function invoke(message: string, promptNames: string[]): Promise<void> {
    // Load prompts if any were specified
    const prompts = loadPrompts(promptNames);
    const finalMessage = combinePromptsWithMessage(prompts, message);

    if (prompts.length > 0) {
        console.log(chalk.green(`Using ${prompts.length} prompt(s) with your request`));
    }

    const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
    const invokeFile = join(homeDir, ".a-la-carte", "invoke.sh");

    if (!existsSync(invokeFile)) {
        console.log(chalk.red(`Error: invoke.sh file not found at ${invokeFile}`));
        console.log(chalk.yellow("Please create this file and make it executable."));
        console.log(chalk.yellow("It should contain the command to invoke your AI assistant."));
        return;
    }

    try {
        await bash(`bash "${invokeFile}" "${finalMessage}"`);
    } catch (error) {
        console.log(chalk.red("Error executing invoke.sh:"));
        console.log(error);
    }
}

export const registerInvokeCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("invoke")
        .description("Invoke your AI assistant using a custom script")
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            collectPrompts,
            []
        )
        .argument("<message>", "The message to send to your AI assistant")
        .action(async (message: string, options: { prompt: string[] }) => {
            await invoke(message, options.prompt);
        });
};
