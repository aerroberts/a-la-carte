import chalk from "chalk";
import { bash } from "../../utils/bash";
import { Log } from "../../utils/logger";

export interface ShoveArgs {
    message?: string;
}

export async function shoveCodeHandler(args: ShoveArgs): Promise<void> {
    const origin = await bash("git remote get-url origin --push");
    const originRepo = origin.trim().split("https://github.com/")[1];
    Log.info(`Shoving changes to ${chalk.whiteBright(originRepo)} . . .`);

    await bash("git add -A");
    await bash(`git commit -m "${args.message || "Shoving changes"}"`);
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
    await bash("git push");

    Log.log(
        `Pushed changes to ${chalk.whiteBright(originRepo)} for changes to ${chalk.whiteBright(files)} files +${chalk.green(
            added
        )} -${chalk.red(deleted)}`
    );
    Log.success("Shoved changes");
}
