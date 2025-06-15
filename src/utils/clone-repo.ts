import { existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { bash } from "./bash";

/**
 * Clones a repository to a temporary directory.
 * @param repoUrl - The URL of the repository to clone.
 * @returns The path to the cloned repository.
 */
export async function cloneFreshRepo(): Promise<string> {
    const commitHashRaw = await bash("git rev-parse HEAD");
    const commitHash = commitHashRaw.trim();
    const repoUrlRaw = await bash("git remote get-url origin");
    const repoUrl = repoUrlRaw.trim();

    console.log(`Your repo is ${chalk.green(repoUrl)} at ${chalk.whiteBright(commitHash)} . . .`);

    const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
    const randomId = Math.random().toString(36).substring(2, 15);
    const aiDir = join(homeDir, ".a-la-carte", "tmp", randomId);

    if (existsSync(aiDir)) {
        await bash(`rm -rf ${aiDir}`);
    }
    await bash(`mkdir -p ${aiDir}`);
    await bash(`git clone ${repoUrl} ${aiDir}`);
    await bash(`cd ${aiDir} && git checkout ${commitHash}`);
    return aiDir;
}
