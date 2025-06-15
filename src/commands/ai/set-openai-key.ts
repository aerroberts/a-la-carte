import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { Config } from "../../utils/state";

export const registerSetOpenAiKeyCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("set-openai-key")
        .description("Set your OpenAI API key")
        .argument("<key>", "Your OpenAI API key")
        .action(async (key: string) => {
            Config.setKey("openai-api-key", key);
            console.log(chalk.green("OpenAI API key saved successfully!"));
        });
};
