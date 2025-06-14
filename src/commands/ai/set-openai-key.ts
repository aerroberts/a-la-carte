import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { Config } from "../../utils/state";

export class AiSetOpenAiKeyCommand implements CommandRegistration {
    name = "set-openai-key";
    description = "Sets the OpenAI API key for use with AI commands";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<key>", "The OpenAI API key to store")
            .action(async (key) => {
                await this.setOpenAiKey(key);
            });
    }

    private async setOpenAiKey(key: string): Promise<void> {
        Config.setKey("openai-api-key", key);
        console.log(
            chalk.green(`Successfully set OpenAI API key (${chalk.whiteBright(`${key.substring(0, 14)}...`)})`)
        );
    }
}
