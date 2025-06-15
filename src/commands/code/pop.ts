import chalk from "chalk";
import { bash } from "../../utils/bash";

export interface PopArgs {}

async function pop(): Promise<void> {
    try {
        // Stash current changes if any
        const status = await bash("git status --porcelain");
        if (status.trim()) {
            await bash("git stash");
            console.log(chalk.yellow("Stashed current changes"));
        }

        // Pop the latest stash
        await bash("git stash pop");
        console.log(chalk.green("Popped the latest stash"));
    } catch (error) {
        console.log(chalk.red("Error popping stash:"));
        console.log(error);
    }
}

export async function popStash(_: PopArgs): Promise<void> {
    await pop();
}
