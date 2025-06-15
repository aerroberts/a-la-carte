import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { Config } from "../../utils/state";

export const registerSetSourceCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("set-source")
        .description("Set the source URL for configuration syncing")
        .argument("<url>", "The git repository URL to sync configuration from")
        .action(async (url: string) => {
            Config.setKey("config-source", url);
            console.log(chalk.green(`Configuration source set to: ${chalk.whiteBright(url)}`));
        });
};
