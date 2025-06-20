import chalk from "chalk";
import { bash } from "../../utils/bash/bash";
import { logDiffStats } from "../../utils/diff";
import { Log } from "../../utils/logger";

export interface ShoveArgs {
    message?: string;
}

export async function shoveCodeHandler(args: ShoveArgs): Promise<void> {
    const origin = await bash("git remote get-url origin --push");
    const originRepo = origin.trim().split("https://github.com/")[1];

    await bash("git add -A");
    await bash(`git commit -m "${args.message || "Shoving changes"}"`);
    await bash("git push");

    await logDiffStats();
    Log.log(`Pushed changes to ${chalk.whiteBright(originRepo)}`);
}
