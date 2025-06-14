import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";

const ClaudeRequest = (message: string) => {
    // Clean and escape the message to avoid bash issues
    const cleanMessage = message.replace(/"/g, '\\"').replace(/`/g, "\\`").replace(/\$/g, "\\$");
    return `For the following request, please solve it and then open a github PR for me once you are confident that the solution is correct. Make sure to create a separate branch for the PR and credit yourself for the work in the pr description. When you create your branch, name the branch something like @claude/[todays date]/[2-3 word description of the request] like @claude/2025-06-13/add-a-new-feature <request> ${cleanMessage} </request>`;
};

export class AskClaudeCommand implements CommandRegistration {
    name = "claude";
    description =
        "Deligate a request to claude for it to solve. Claude will clone the current repository and solve the request then open a PR for you.";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<message>", "The message to ask claude")
            .action(async (message) => {
                await this.ask(message);
            });
    }

    private async ask(message: string): Promise<void> {
        const aiRepoDir = await cloneFreshRepo();
        await bashInNewTerminal(aiRepoDir, `claude --dangerously-skip-permissions "${ClaudeRequest(message)}"`);
        console.log("Claude will work in a new terminal window on a copy of your local repository . . .");
    }
}
