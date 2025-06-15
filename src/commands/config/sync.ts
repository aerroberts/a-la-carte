import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { Config } from "../../utils/state";

export interface SyncArgs {}

async function sync(): Promise<void> {
    try {
        const source = Config.loadKey<string>("config-source");
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const configDir = join(homeDir, ".a-la-carte");

        // Ensure the .a-la-carte directory exists
        if (!existsSync(configDir)) {
            mkdirSync(configDir, { recursive: true });
        }

        console.log(chalk.blue(`Syncing configuration from: ${chalk.whiteBright(source)}`));

        // Clone or pull the repository
        const repoPath = join(configDir, "config-repo");
        if (existsSync(repoPath)) {
            console.log(chalk.yellow("Configuration repository already exists, pulling latest changes..."));
            execSync("git pull", { cwd: repoPath, stdio: "inherit" });
        } else {
            console.log(chalk.yellow("Cloning configuration repository..."));
            execSync(`git clone "${source}" config-repo`, { cwd: configDir, stdio: "inherit" });
        }

        console.log(chalk.green("Configuration synced successfully!"));
    } catch (error) {
        if (error instanceof Error && error.message.includes("config-source")) {
            console.log(chalk.red("Error: Configuration source not set."));
            console.log(chalk.yellow("Please set your configuration source first using:"));
            console.log(chalk.whiteBright("  a config set-source <git-repository-url>"));
        } else {
            console.log(chalk.red("Error syncing configuration:"));
            console.log(error);
        }
    }
}

export async function syncConfig(_: SyncArgs): Promise<void> {
    await sync();
}
