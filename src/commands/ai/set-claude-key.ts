import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { Config } from "../../utils/state";

export class AiSetClaudeKeyCommand implements CommandRegistration {
    name = "set-claude-key";
    description = "Sets the Anthropic Claude API key for use with AI commands";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<key>", "The Anthropic Claude API key to store")
            .action(async (key) => {
                await this.setClaudeKey(key);
            });
    }

    private async setClaudeKey(key: string): Promise<void> {
        Config.setKey("claude-api-key", key);
        console.log(
            chalk.green(`Successfully set Claude API key (${chalk.whiteBright(`${key.substring(0, 14)}...`)})`)
        );
    }
}
