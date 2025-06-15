import chalk from "chalk";
import { bash } from "../../utils/bash";
import { logDiffStats } from "../../utils/diff";
import { Log } from "../../utils/logger";

export interface PopArgs {
    message?: string;
}

export async function popCodeHandler(args: PopArgs): Promise<void> {
    Log.info("Poping your local changes off into a Pull Request");

    const userName = process.env.HOME?.split("/").pop() || "feature";
    const randomHash = Math.random().toString(36).substring(2, 15);
    const newBranchName = `@${userName}/${randomHash}`;

    await bash(`git checkout -b ${newBranchName}`);
    Log.log(`Created new branch ${chalk.whiteBright(newBranchName)}`);

    await bash("git add -A");
    await bash(`git commit -m "${args.message || "Code Changes"}"`);
    await logDiffStats();

    await bash(`git push -u origin ${newBranchName}`);
    Log.log(`Pushed changes to remote branch ${chalk.whiteBright(newBranchName)}`);
    const prOutput = await bash(
        `gh pr create --title "${args.message || "Code Changes"}" --body "Automatically created PR from cli"`
    );
    const prUrl = prOutput.match(/https:\/\/github\.com\/[^\s]+/)?.[0];
    Log.log(`Created Pull Request for branch ${chalk.whiteBright(newBranchName)}`);

    await bash("git checkout -");
    Log.log("Switched back to previous branch without changes");

    Log.success(`Popped your local changes off into a Pull Request: ${chalk.whiteBright(prUrl)}`);
}
