import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";

export class CodeRebasePrsCommand implements CommandRegistration {
    name = "rebase-prs";
    description = "Merges the default branch into all your open pull requests";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .option("-w, --watch", "Keep rebasing every minute until stopped")
            .action(async (options: { watch?: boolean }) => {
                await this.rebasePrs(Boolean(options.watch));
            });
    }

    private async listOpenPrs(): Promise<{ repo: string; number: number; title: string }[]> {
        const query = `{
            viewer {
                pullRequests(first: 100, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
                    nodes {
                        number
                        title
                        repository { nameWithOwner }
                    }
                }
            }
        }`;

        const escaped = query.replace(/'/g, "\\'").replace(/\n/g, " ").trim();
        const raw = await bash(`gh api graphql -f query='${escaped}'`);

        try {
            const data = JSON.parse(raw);
            const nodes = data.data.viewer.pullRequests.nodes as Array<{
                number: number;
                title: string;
                repository: { nameWithOwner: string };
            }>;
            return nodes.map((n) => ({ repo: n.repository.nameWithOwner, number: n.number, title: n.title }));
        } catch {
            console.log(chalk.red("Failed to parse output from gh"));
            return [];
        }
    }

    private async updatePr(pr: { repo: string; number: number; title: string }): Promise<void> {
        try {
            await bash(`gh api -X PUT repos/${pr.repo}/pulls/${pr.number}/update-branch`);
            console.log(chalk.green(`Updated ${pr.repo}#${pr.number}: ${chalk.whiteBright(pr.title)}`));
        } catch (err) {
            console.log(chalk.yellow(`Could not update ${pr.repo}#${pr.number}: ${err}`));
        }
    }

    private async rebasePrs(watch: boolean): Promise<void> {
        do {
            const prs = await this.listOpenPrs();
            if (prs.length === 0) {
                console.log(chalk.green("No open pull requests found"));
            }
            for (const pr of prs) {
                await this.updatePr(pr);
            }
            if (watch) {
                await new Promise((r) => setTimeout(r, 60000));
            }
        } while (watch);
    }
}
