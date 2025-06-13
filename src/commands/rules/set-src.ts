import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { Config } from "../../utils/state";

export class RuleSetSourceCommand implements CommandRegistration {
    name = "set-src";
    description = "Sets the source repository for rules to be pulled from";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<url>", "The GitHub repository URL to use as rules source")
            .action(async (url) => {
                await this.setSource(url);
            });
    }

    private async setSource(url: string): Promise<void> {
        Config.setKey("rule-src", url);
        console.log(
            chalk.green(`Successfully set rules source directory to ${chalk.whiteBright(url)}`)
        );
    }
}
