import type { Command as CommanderCommand } from "commander";
import type { CommandRegistration } from "../types";
import { Log } from "../utils/logger";

export class CoinflipCommand implements CommandRegistration {
    name = "coinflip";
    description = "Flip a coin";

    register(program: CommanderCommand): void {
        program
            .command(this.name)
            .description(this.description)
            .action(async () => {
                await this.execute();
            });
    }

    private async execute(): Promise<void> {
        Log.log("Flipping a coin...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = Math.random() < 0.5 ? "heads" : "tails";
        Log.log(`The coin landed on ${result}`);
    }
}
