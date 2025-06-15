import chalk from "chalk";
import { bashInNewTerminal } from "../../utils/bash-new-terminal";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";
import { Config } from "../../utils/state";

export interface AskCodexArgs {
    message: string;
    prompt: string[];
    delegate: boolean;
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
        await bashInNewTerminal({
            command: `export OPENAI_API_KEY="${openAiKey}" && codex --full-auto "${finalMessage}"`,
            dir: aiRepoDir,
        });
        console.log("Codex will work in a new terminal window on a copy of your local repository.");
    } else {
        const currentDir = process.cwd();
        await bashInNewTerminal({
            command: `export OPENAI_API_KEY="${openAiKey}" && codex --full-auto "${finalMessage}"`,
            dir: currentDir,
        });
        console.log("Codex will work in a new terminal window in your current workspace.");
    }
}

export async function askCodex(args: AskCodexArgs): Promise<void> {
    const { message, prompt, delegate } = args;
    await ask(message, prompt, delegate);
}
