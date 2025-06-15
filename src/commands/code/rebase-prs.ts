import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { bash } from "../../utils/bash";

async function rebasePrs(): Promise<void> {
    try {
        console.log(chalk.blue("Fetching latest changes from origin..."));
        await bash("git fetch origin");

        // Get all open PRs
        const prList = await bash("gh pr list --state open --json number,headRefName");
        const prs = JSON.parse(prList);

        if (prs.length === 0) {
            console.log(chalk.yellow("No open PRs found"));
            return;
        }

        console.log(chalk.green(`Found ${prs.length} open PR(s)`));

        for (const pr of prs) {
            const branchName = pr.headRefName;
            const prNumber = pr.number;

            console.log(chalk.blue(`\nRebasing PR #${prNumber} (${branchName})...`));

            try {
                // Checkout the PR branch
                await bash(`git checkout ${branchName}`);

                // Rebase against main
                await bash("git rebase origin/main");

                // Force push the rebased branch
                await bash(`git push --force-with-lease origin ${branchName}`);

                console.log(chalk.green(`✓ Successfully rebased PR #${prNumber}`));
            } catch (error) {
                console.log(chalk.red(`✗ Failed to rebase PR #${prNumber}: ${error}`));
            }
        }

        // Return to main branch
        await bash("git checkout main");
        console.log(chalk.green("\nRebase operation completed"));
    } catch (error) {
        console.log(chalk.red("Error during rebase operation:"));
        console.log(error);
    }
}

export const registerRebasePrsCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("rebase-prs")
        .description("Rebase all open pull requests against the main branch")
        .action(async () => {
            await rebasePrs();
        });
};
