import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";

interface PullRequest {
    number: number;
    title: string;
    headRefName: string;
    baseRefName: string;
    state: string;
}

export class CodeRebasePrsCommand implements CommandRegistration {
    name = "rebase-prs";
    description = "Auto-rebase open PRs by merging main branch into them";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .option("-w, --watch", "Watch mode - retry every minute")
            .action(async (options) => {
                if (options.watch) {
                    await this.watchMode();
                } else {
                    await this.rebasePrs();
                }
            });
    }

    private async rebasePrs(): Promise<void> {
        try {
            console.log(chalk.blue("Fetching open PRs..."));

            const currentBranch = await bash("git branch --show-current");
            const mainBranch = await this.getMainBranch();

            const prs = await this.getOpenPRs();

            if (prs.length === 0) {
                console.log(chalk.yellow("No open PRs found."));
                return;
            }

            console.log(chalk.green(`Found ${prs.length} open PR(s):`));
            for (const pr of prs) {
                console.log(`  #${pr.number}: ${pr.title} (${pr.headRefName})`);
            }

            for (const pr of prs) {
                await this.rebaseSinglePR(pr, mainBranch);
            }

            if (currentBranch.trim()) {
                console.log(chalk.blue(`Switching back to ${currentBranch.trim()}`));
                await bash(`git checkout ${currentBranch.trim()}`);
            }
        } catch (error) {
            console.error(chalk.red(`Error: ${error}`));
            process.exit(1);
        }
    }

    private async watchMode(): Promise<void> {
        console.log(chalk.blue("Starting watch mode - checking every minute..."));
        console.log(chalk.gray("Press Ctrl+C to stop"));

        while (true) {
            try {
                await this.rebasePrs();
                console.log(chalk.gray("Waiting 60 seconds before next check..."));
                await this.sleep(60000);
            } catch (error) {
                console.error(chalk.red(`Error in watch mode: ${error}`));
                console.log(chalk.gray("Waiting 60 seconds before retry..."));
                await this.sleep(60000);
            }
        }
    }

    private async getOpenPRs(): Promise<PullRequest[]> {
        const result = await bash("gh pr list --json number,title,headRefName,baseRefName,state --author @me");
        return JSON.parse(result) as PullRequest[];
    }

    private async getMainBranch(): Promise<string> {
        try {
            const result = await bash("git symbolic-ref refs/remotes/origin/HEAD");
            return result.trim().replace("refs/remotes/origin/", "");
        } catch {
            return "main";
        }
    }

    private async rebaseSinglePR(pr: PullRequest, mainBranch: string): Promise<void> {
        console.log(chalk.blue(`\nProcessing PR #${pr.number}: ${pr.title}`));

        try {
            console.log(chalk.gray(`  Switching to branch ${pr.headRefName}...`));
            await bash(`git checkout ${pr.headRefName}`);

            console.log(chalk.gray(`  Fetching latest ${mainBranch}...`));
            await bash(`git fetch origin ${mainBranch}`);

            console.log(chalk.gray(`  Merging ${mainBranch} into ${pr.headRefName}...`));
            const mergeResult = await bash(`git merge origin/${mainBranch}`);

            if (mergeResult.includes("Already up to date")) {
                console.log(chalk.green(`  PR #${pr.number} is already up to date`));
                return;
            }

            console.log(chalk.gray("  Pushing updated branch..."));
            await bash(`git push origin ${pr.headRefName}`);

            console.log(chalk.green(`  Successfully rebased PR #${pr.number}`));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes("CONFLICT")) {
                console.log(chalk.yellow(`  PR #${pr.number} has merge conflicts - skipping`));
                await bash("git merge --abort").catch(() => {});
            } else if (errorMessage.includes("pathspec") && errorMessage.includes("did not match")) {
                console.log(chalk.yellow(`  Branch ${pr.headRefName} not found locally - skipping`));
            } else {
                console.log(chalk.red(`  Failed to rebase PR #${pr.number}: ${errorMessage}`));
            }
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
