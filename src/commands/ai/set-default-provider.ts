import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { Config } from "../../utils/state";

export class AiSetDefaultProviderCommand implements CommandRegistration {
    name = "set-default-provider";
    description = "Sets the default AI provider (openai or claude)";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<provider>", "Provider to use: openai or claude")
            .action(async (provider) => {
                await this.setProvider(provider);
            });
    }

    private async setProvider(provider: string): Promise<void> {
        const normalized = provider.toLowerCase();
        if (normalized !== "openai" && normalized !== "claude") {
            console.log(chalk.red("Provider must be 'openai' or 'claude'"));
            process.exit(1);
        }
        Config.setKey("default-provider", normalized);
        console.log(chalk.green(`Default provider set to ${chalk.whiteBright(normalized)}`));
    }
}
