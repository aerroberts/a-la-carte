import chalk from "chalk";
import type { Command } from "commander";
import { existsSync } from "fs";
import { join } from "path";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";

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
        const commitHash = (await bash("git rev-parse HEAD")).trim();
        const repoUrl = (await bash("git remote get-url origin")).trim();

        console.log(
            `Your repo is ${chalk.green(repoUrl)} at ${chalk.whiteBright(commitHash)} . . .`
        );

        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const randomId = Math.random().toString(36).substring(2, 15);
        const aiDir = join(homeDir, ".a-la-carte", "ai", randomId);
        if (existsSync(aiDir)) {
            await bash(`rm -rf ${aiDir}`);
        }
        await bash(`mkdir -p ${aiDir}`);

        await bash(`git clone ${repoUrl} ${aiDir}`);
        console.log(
            `Created copy of local repository at ${chalk.whiteBright(aiDir)} for claude to use.`
        );

        const command = `cd ${aiDir} && claude --dangerously-skip-permissions "For the following request, please solve it and then open a github PR for me once you are confident that the solution is correct. Make sure to create a separate branch for the PR and credit yourself for the work in the pr description: ${message}"`;

        // Create a temporary shell script to run in the new terminal
        const scriptDir = join(homeDir, ".a-la-carte", "tmp", randomId);
        if (existsSync(scriptDir)) {
            await bash(`rm -rf ${scriptDir}`);
        }
        await bash(`mkdir -p ${scriptDir}`);

        const scriptPath = join(scriptDir, "run_claude.sh");
        await bash(
            `echo '#!/bin/bash\n${command}\necho "Press any key to close..."\nread -n 1' > ${scriptPath}`
        );
        await bash(`chmod +x ${scriptPath}`);

        console.log(
            "Claude has been asked to solve the request, it will run in a new terminal window on a copy of your local repository and cut a PR for you when it is done."
        );

        // Open new Terminal window with the script
        await bash(`open -a Terminal ${scriptPath}`);
    }
}
