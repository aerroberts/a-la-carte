import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { Config } from "../../utils/state";

export class AskCodexCommand implements CommandRegistration {
    name = "codex";
    description =
        "Delegate a request to OpenAI Codex for it to solve. Codex will work on the current repository in a new terminal window.";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<message>", "The message to ask codex")
            .action(async (message) => {
                await this.ask(message);
            });
    }

    private async getOpenAiKey(): Promise<string> {
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

    private async ask(message: string): Promise<void> {
        const openAiKey = await this.getOpenAiKey();
        const aiRepoDir = await cloneFreshRepo();
        await bashInNewTerminal(aiRepoDir, `export OPENAI_API_KEY="${openAiKey}" && codex "${message}"`);
        console.log("Codex will work in a new terminal window on a copy of your local repository.");
    }
}
