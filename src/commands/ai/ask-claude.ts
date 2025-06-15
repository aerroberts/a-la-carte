import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";

export class AskClaudeCommand implements CommandRegistration {
    name = "claude";
    description =
        "Ask claude to help with a request. By default, claude will work in the current workspace. Use --delegate to have claude work in a fresh cloned repository.";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .option(
                "-p, --prompt <name>",
                "Load a prompt from the config system (can be used multiple times)",
                this.collectPrompts,
                []
            )
            .option("-d, --delegate", "Clone the current repository and have claude work in a separate workspace")
            .argument("<message>", "The message to ask claude")
            .action(async (message: string, options: { prompt: string[]; delegate?: boolean }) => {
                await this.ask(message, options.prompt, options.delegate || false);
            });
    }

    private collectPrompts(value: string, previous: string[]): string[] {
        return previous.concat([value]);
    }

    private async ask(message: string, promptNames: string[], delegate: boolean): Promise<void> {
        // Load prompts if any were specified
        const prompts = loadPrompts(promptNames);
        const finalMessage = combinePromptsWithMessage(prompts, message);

        if (prompts.length > 0) {
            console.log(chalk.green(`Using ${prompts.length} prompt(s) with your request`));
        }

        if (delegate) {
            const aiRepoDir = await cloneFreshRepo();
            await bashInNewTerminal(aiRepoDir, `claude --dangerously-skip-permissions "${finalMessage}"`);
            console.log("Claude will work in a new terminal window on a copy of your local repository . . .");
        } else {
            const currentDir = process.cwd();
            await bashInNewTerminal(currentDir, `claude --dangerously-skip-permissions "${finalMessage}"`);
            console.log("Claude will work in a new terminal window in your current workspace . . .");
        }
    }
}
