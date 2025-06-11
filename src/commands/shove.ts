import type { Command } from "commander";
import type { CommandRegistration } from "../types";
import { bash } from "../utils/bash";

export class ShoveCommand implements CommandRegistration {
    name = "shove";
    description = "Force pushes your local changes to the remote repository";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<message>", "The message to commit with")
            .action(async (message) => {
                await this.shove(message);
            });
    }

    private async shove(message: string): Promise<void> {
        await bash("git add -A");
        await bash(`git commit -m "${message}"`);
        await bash("git push");
    }
}
