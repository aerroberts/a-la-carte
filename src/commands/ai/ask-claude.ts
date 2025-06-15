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

async function getClaudeKey(): Promise<string> {
    let claudeKey: string;
    try {
        claudeKey = Config.loadKey<string>("claude-api-key");
    } catch {
        console.log(chalk.red("Error: Claude API key not configured."));
        console.log(chalk.yellow("Please set your Claude API key first using:"));
        console.log(chalk.whiteBright("  a ai set-claude-key <your-api-key>"));
        process.exit(1);
    }
    return claudeKey;
}

async function ask(message: string, promptNames: string[], delegate: boolean): Promise<void> {
    // Load prompts if any were specified
    const prompts = loadPrompts(promptNames);
    const finalMessage = combinePromptsWithMessage(prompts, message);

    if (prompts.length > 0) {
        console.log(chalk.green(`Using ${prompts.length} prompt(s) with your request`));
    }

    const claudeKey = await getClaudeKey();

    if (delegate) {
        const aiRepoDir = await cloneFreshRepo();
        await bashInNewTerminal(
            aiRepoDir,
            `export ANTHROPIC_API_KEY="${claudeKey}" && claude --full-auto "${finalMessage}"`
        );
        console.log("Claude will work in a new terminal window on a copy of your local repository.");
    } else {
        const currentDir = process.cwd();
        await bashInNewTerminal(
            currentDir,
            `export ANTHROPIC_API_KEY="${claudeKey}" && claude --full-auto "${finalMessage}"`
        );
        console.log("Claude will work in a new terminal window in your current workspace.");
    }
}

export const registerAskClaudeCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("claude")
        .description(
            "Ask Claude to help with a request. By default, claude will work in the current workspace. Use --delegate to have claude work in a fresh cloned repository."
        )
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            collectPrompts,
            []
        )
        .option("-d, --delegate", "Clone the current repository and have claude work in a separate workspace")
        .argument("<message>", "The message to ask claude")
        .action(async (message: string, options: { prompt: string[]; delegate?: boolean }) => {
            await ask(message, options.prompt, options.delegate || false);
        });
};
