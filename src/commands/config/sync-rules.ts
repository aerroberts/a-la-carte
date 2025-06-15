import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import chalk from "chalk";
import { Log } from "../../utils/logger";

export interface SyncRulesArgs {}

export async function syncRulesConfigHandler(_: SyncRulesArgs): Promise<void> {
    Log.info("Syncing rules from prompts/rules to .cursor/rules");

    const gitRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
    Log.log(`Git workspace root: ${chalk.whiteBright(gitRoot)}`);

    const sourceDir = join(process.cwd(), "prompts", "rules");
    Log.log(`Source rules directory: ${chalk.whiteBright(sourceDir)}`);

    const targetDir = join(gitRoot, ".cursor", "rules");
    mkdirSync(targetDir, { recursive: true });

    const ruleFiles = readdirSync(sourceDir).filter((file) => extname(file) === ".mdc");

    if (ruleFiles.length === 0) {
        Log.warning("No rule files (.mdc) found in prompts/rules");
        return;
    }

    Log.log(`Found ${chalk.whiteBright(ruleFiles.length.toString())} rule files: ${chalk.cyan(ruleFiles.join(", "))}`);

    // Copy each rule file
    let copiedCount = 0;
    for (const file of ruleFiles) {
        const sourcePath = join(sourceDir, file);
        const targetPath = join(targetDir, file);

        const content = readFileSync(sourcePath, "utf-8");
        writeFileSync(targetPath, content, "utf-8");

        Log.log(`Copied ${chalk.green(file)}`);
        copiedCount++;
    }

    Log.success(
        `Successfully synced ${chalk.green(copiedCount.toString())} rule files to ${chalk.whiteBright(targetDir)}`
    );
}
