import chalk from "chalk";
import { bash } from "./bash";
import { Log } from "./logger";

export async function logDiffStats() {
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

    Log.log(
        `Code changes impacted ${chalk.whiteBright(files)} files with ${chalk.green(`+${added} added`)} lines and ${chalk.red(
            `-${deleted} deleted`
        )} lines`
    );
}
