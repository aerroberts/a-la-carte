import chalk from "chalk";
import { bashInNewTerminal } from "../../utils/bash-new-terminal";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";
import { Config } from "../../utils/state";

export interface AskClaudeArgs {
    message: string;
    prompt: string[];
    delegate: boolean;
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
        await bashInNewTerminal({
            command: `export ANTHROPIC_API_KEY="${claudeKey}" && claude --full-auto "${finalMessage}"`,
            dir: aiRepoDir,
        });
        console.log("Claude will work in a new terminal window on a copy of your local repository.");
    } else {
        const currentDir = process.cwd();
        await bashInNewTerminal({
            command: `export ANTHROPIC_API_KEY="${claudeKey}" && claude --full-auto "${finalMessage}"`,
            dir: currentDir,
        });
        console.log("Claude will work in a new terminal window in your current workspace.");
    }
}

export async function askClaude(args: AskClaudeArgs): Promise<void> {
    const { message, prompt, delegate } = args;
    await ask(message, prompt, delegate);
}
