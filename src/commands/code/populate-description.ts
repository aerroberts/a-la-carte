import { unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";

export class CodePopulateDescriptionCommand implements CommandRegistration {
    name = "populate-description";
    description = "Populate PR description by analyzing the diff using AI";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<pr-url>", "Pull request URL to populate description for")
            .action(async (prUrl: string) => {
                await this.populateDescription(prUrl);
            });
    }

    private async populateDescription(prUrl: string): Promise<void> {
        try {
            const prInfo = this.parsePrUrl(prUrl);
            if (!prInfo) {
                console.log(
                    chalk.red("Invalid PR URL format. Expected format: https://github.com/owner/repo/pull/123")
                );
                return;
            }

            console.log(chalk.green(`Fetching diff for PR #${prInfo.prNumber} in ${prInfo.owner}/${prInfo.repo}...`));

            // Get the PR diff using GitHub CLI
            const diff = await bash(`gh pr diff ${prInfo.prNumber} --repo ${prInfo.owner}/${prInfo.repo}`);

            if (!diff.trim()) {
                console.log(chalk.yellow("No diff found for this PR."));
                return;
            }

            // Create a temporary file with the prompt
            const tempFile = this.createTempPromptFile(diff);

            console.log(chalk.green("Analyzing diff and generating description..."));

            // Use the AI invoke command to generate the description
            const description = await bash(`a ai invoke -p prDescription "${tempFile}"`);

            if (description.trim()) {
                console.log(chalk.green("\nGenerated PR Description:"));
                console.log(chalk.whiteBright(description.trim()));

                // Update the PR description
                const tempDescFile = join(process.cwd(), "temp-pr-desc.txt");
                writeFileSync(tempDescFile, description.trim(), "utf-8");

                try {
                    await bash(
                        `gh pr edit ${prInfo.prNumber} --repo ${prInfo.owner}/${prInfo.repo} --body-file "${tempDescFile}"`
                    );
                    console.log(chalk.green(`\nSuccessfully updated PR #${prInfo.prNumber} description!`));
                    unlinkSync(tempDescFile);
                } catch (updateError) {
                    console.log(chalk.yellow(`\nCould not automatically update PR description: ${updateError}`));
                    console.log(chalk.gray("You can manually copy the description above and update the PR."));
                    unlinkSync(tempDescFile);
                }
            } else {
                console.log(chalk.yellow("No description was generated."));
            }
        } catch (error) {
            console.log(chalk.red(`Error: ${error}`));
        }
    }

    private parsePrUrl(url: string): { owner: string; repo: string; prNumber: string } | null {
        // Parse GitHub PR URLs: https://github.com/owner/repo/pull/123
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
        if (!match) {
            return null;
        }
        return {
            owner: match[1],
            repo: match[2],
            prNumber: match[3],
        };
    }

    private createTempPromptFile(diff: string): string {
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const tempDir = join(homeDir, ".a-la-carte", "tmp");
        const tempFile = join(tempDir, `pr-description-${Date.now()}.txt`);
        writeFileSync(tempFile, diff, "utf-8");
        return tempFile;
    }
}
