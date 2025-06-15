import { existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { bash } from "../../utils/bash";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";

export interface InvokeArgs {
    message: string;
    prompt: string[];
}

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

export async function invokeAi(args: InvokeArgs): Promise<void> {
    const { message, prompt } = args;
    await invoke(message, prompt);
}
