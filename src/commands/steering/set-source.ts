import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { Config } from "../../utils/state";

export class SteeringSetSourceCommand implements CommandRegistration {
    name = "set-source";
    description = "Sets the source repository for steering rules and prompts to be pulled from";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<url>", "The GitHub repository URL to use as steering source")
            .action(async (url) => {
                await this.setSource(url);
            });
    }

    private async setSource(url: string): Promise<void> {
        Config.setKey("steering-src", url);
        console.log(chalk.green(`Successfully set steering source directory to ${chalk.whiteBright(url)}`));
    }
}
