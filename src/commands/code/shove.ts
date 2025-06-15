import chalk from "chalk";
import { bash } from "../../utils/bash";

export interface ShoveArgs {
    message: string;
}

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

export async function shoveChanges(args: ShoveArgs): Promise<void> {
    await shove(args.message);
}
