import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { Config } from "../../utils/state";

export const registerSetClaudeKeyCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("set-claude-key")
        .description("Set your Claude API key")
        .argument("<key>", "Your Claude API key")
        .action(async (key: string) => {
            Config.setKey("claude-api-key", key);
            console.log(chalk.green("Claude API key saved successfully!"));
        });
};
