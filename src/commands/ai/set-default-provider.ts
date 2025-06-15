import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { Config } from "../../utils/state";

export const registerSetDefaultProviderCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("set-default-provider")
        .description("Set your default AI provider (openai or claude)")
        .argument("<provider>", "The AI provider to set as default (openai or claude)")
        .action(async (provider: string) => {
            if (provider !== "openai" && provider !== "claude") {
                console.log(chalk.red("Error: Provider must be either 'openai' or 'claude'"));
                return;
            }

            Config.setKey("default-provider", provider);
            console.log(chalk.green(`Default AI provider set to ${provider}!`));
        });
};
