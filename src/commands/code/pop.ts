import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";

export class CodePopCommand implements CommandRegistration {
    name = "pop";
    description = "Commit current work to a temporary branch and open a PR";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<message>", "Commit message to use when creating the pull request")
            .action(async (message: string) => {
                await this.pop(message);
            });
    }

    private async pop(message: string): Promise<void> {
        const user = process.env.USER || process.env.USERNAME || "user";
        const hash = Math.random().toString(36).substring(2, 8);
        const branch = `@${user}/${hash}`;

        await bash(`git checkout -b ${branch}`);
        await bash("git add -A");
        await bash(`git commit -m \"${message}\"`);
        await bash(`git push -u origin ${branch}`);

        try {
            await bash(`gh pr create --title \"${message}\" --body "" --head ${branch} --base main`);
        } catch {
            console.log(chalk.yellow("Failed to automatically create PR. Please create it manually."));
        }

        await bash("git checkout main");
    }
}
