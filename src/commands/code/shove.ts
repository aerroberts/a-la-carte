import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { bash } from "../../utils/bash";

async function shove(message: string): Promise<void> {
    await bash("git add -A");
    await bash(`git commit -m "${message}"`);
    await bash("git push");

    const origin = await bash("git remote get-url origin --push");
    const originRepo = origin.trim().split("https://github.com/")[1];
    const diff = await bash("git log -1 --pretty=tformat: --numstat");
    let added = 0;
    let deleted = 0;
    let files = 0;
    for (const line of diff.split("\n").filter(Boolean)) {
        const [a, d, _] = line.split("\t").map(Number);
        added += a;
        deleted += d;
        files++;
    }

    const log = `Pushing changes to ${chalk.whiteBright(originRepo)} for changes to ${chalk.whiteBright(files)} files +${chalk.green(added)} -${chalk.red(deleted)}`;
    console.log(log);
}

export const registerShoveCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("shove")
        .description("Force pushes your local changes to the remote repository")
        .argument("<message>", "The message to commit with")
        .action(async (message: string) => {
            await shove(message);
        });
};
