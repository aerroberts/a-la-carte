import type { Command as CommanderCommand } from "commander";
import type { CommandRegistration } from "../command";
import type { Logger } from "../utils/logger";

export class CoinflipCommand implements CommandRegistration {
    name = "coinflip";
    description = "Flip a coin";

    register(program: CommanderCommand, logger: Logger): void {
        program
            .command(this.name)
            .description(this.description)
            .action(async () => {
                await this.execute(logger);
            });
    }

    private async execute(logger: Logger): Promise<void> {
        logger.log("Flipping a coin...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = Math.random() < 0.5 ? "heads" : "tails";
        logger.log(`The coin landed on ${result}`);
    }
}
