import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";
import { Config } from "../../utils/state";

export class AskCodexCommand implements CommandRegistration {
    name = "codex";
    description =
        "Delegate a request to OpenAI Codex for it to solve. Codex will work on the current repository in a new terminal window.";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .option(
                "-p, --prompt <name>",
                "Load a prompt from the steering system (can be used multiple times)",
                this.collectPrompts,
                []
            )
            .argument("<message>", "The message to ask codex")
            .action(async (message: string, options: { prompt: string[] }) => {
                await this.ask(message, options.prompt);
            });
    }

    private collectPrompts(value: string, previous: string[]): string[] {
        return previous.concat([value]);
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

    private async ask(message: string, promptNames: string[]): Promise<void> {
        // Load prompts if any were specified
        const prompts = loadPrompts(promptNames);
        const finalMessage = combinePromptsWithMessage(prompts, message);

        if (prompts.length > 0) {
            console.log(chalk.green(`Using ${prompts.length} prompt(s) with your request`));
        }

        const openAiKey = await this.getOpenAiKey();
        const aiRepoDir = await cloneFreshRepo();
        await bashInNewTerminal(
            aiRepoDir,
            `export OPENAI_API_KEY="${openAiKey}" && codex --full-auto "${finalMessage}"`
        );
        console.log("Codex will work in a new terminal window on a copy of your local repository.");
    }
}
