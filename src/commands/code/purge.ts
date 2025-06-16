import chalk from "chalk";
import { bash } from "../../utils/bash";
import { Log } from "../../utils/logger";

export interface PurgeArgs {}

export async function purgeCodeHandler(_args: PurgeArgs): Promise<void> {
    Log.info("Purging local changes and force resetting to remote state");
    const currentBranch = await bash("git branch --show-current");
    const cleanBranch = currentBranch.trim();

    Log.log(`Current branch: ${chalk.whiteBright(cleanBranch)}`);

    await bash(`git reset --hard origin/${cleanBranch}`);
    Log.log(`Force reset to ${chalk.whiteBright(`origin/${cleanBranch}`)}`);

    Log.success(`Successfully purged all local changes and reset to remote state of ${chalk.whiteBright(cleanBranch)}`);
}
