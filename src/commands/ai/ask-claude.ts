import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";

export class AskClaudeCommand implements CommandRegistration {
    name = "claude";
    description =
        "Delegate a request to claude for it to solve. Claude will clone the current repository and solve the request then open a PR for you.";

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
            .argument("<message>", "The message to ask claude")
            .action(async (message: string, options: { prompt: string[] }) => {
                await this.ask(message, options.prompt);
            });
    }

    private collectPrompts(value: string, previous: string[]): string[] {
        return previous.concat([value]);
    }

    private async ask(message: string, promptNames: string[]): Promise<void> {
        // Load prompts if any were specified
        const prompts = loadPrompts(promptNames);
        const finalMessage = combinePromptsWithMessage(prompts, message);

        if (prompts.length > 0) {
            console.log(chalk.green(`Using ${prompts.length} prompt(s) with your request`));
        }

        const aiRepoDir = await cloneFreshRepo();
        await bashInNewTerminal(aiRepoDir, `claude --dangerously-skip-permissions "${finalMessage}"`);
        console.log("Claude will work in a new terminal window on a copy of your local repository . . .");
    }
}
