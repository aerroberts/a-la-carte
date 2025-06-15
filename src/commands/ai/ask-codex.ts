import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";
import { Config } from "../../utils/state";

function collectPrompts(value: string, previous: string[]): string[] {
    return previous.concat([value]);
}

async function getOpenAiKey(): Promise<string> {
    let openAiKey: string;
    try {
        openAiKey = Config.loadKey<string>("openai-api-key");
    } catch {
        console.log(chalk.red("Error: OpenAI API key not configured."));
        console.log(chalk.yellow("Please set your OpenAI API key first using:"));
        console.log(chalk.whiteBright("  a ai set-openai-key <your-api-key>"));
        process.exit(1);
    }
    return openAiKey;
}

async function ask(message: string, promptNames: string[], delegate: boolean): Promise<void> {
    // Load prompts if any were specified
    const prompts = loadPrompts(promptNames);
    const finalMessage = combinePromptsWithMessage(prompts, message);

    if (prompts.length > 0) {
        console.log(chalk.green(`Using ${prompts.length} prompt(s) with your request`));
    }

    const openAiKey = await getOpenAiKey();

    if (delegate) {
        const aiRepoDir = await cloneFreshRepo();
        await bashInNewTerminal(
            aiRepoDir,
            `export OPENAI_API_KEY="${openAiKey}" && codex --full-auto "${finalMessage}"`
        );
        console.log("Codex will work in a new terminal window on a copy of your local repository.");
    } else {
        const currentDir = process.cwd();
        await bashInNewTerminal(
            currentDir,
            `export OPENAI_API_KEY="${openAiKey}" && codex --full-auto "${finalMessage}"`
        );
        console.log("Codex will work in a new terminal window in your current workspace.");
    }
}

export const registerAskCodexCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("codex")
        .description(
            "Ask OpenAI Codex to help with a request. By default, codex will work in the current workspace. Use --delegate to have codex work in a fresh cloned repository."
        )
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            collectPrompts,
            []
        )
        .option("-d, --delegate", "Clone the current repository and have codex work in a separate workspace")
        .argument("<message>", "The message to ask codex")
        .action(async (message: string, options: { prompt: string[]; delegate?: boolean }) => {
            await ask(message, options.prompt, options.delegate || false);
        });
};
