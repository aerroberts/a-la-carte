import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import chalk from "chalk";
import { Log } from "../../utils/logger";

export interface SyncRulesArgs {}

export async function syncRulesConfigHandler(_: SyncRulesArgs): Promise<void> {
    try {
        Log.info("Syncing rules from prompts/rules to .cursor/rules");

        // Find git workspace root
        const gitRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
        Log.log(`Git workspace root: ${chalk.whiteBright(gitRoot)}`);

        // Source directory (prompts/rules from current working directory)
        const sourceDir = join(process.cwd(), "prompts", "rules");
        Log.log(`Source directory: ${chalk.whiteBright(sourceDir)}`);

        // Target directory (.cursor/rules in git root)
        const targetDir = join(gitRoot, ".cursor", "rules");
        Log.log(`Target directory: ${chalk.whiteBright(targetDir)}`);

        // Create target directory if it doesn't exist
        mkdirSync(targetDir, { recursive: true });

        // Read all files from source directory
        let files: string[];
        try {
            files = readdirSync(sourceDir);
        } catch (_error) {
            Log.error(`Cannot read source directory: ${sourceDir}`);
            return;
        }

        // Filter for .mdc files
        const ruleFiles = files.filter((file) => extname(file) === ".mdc");

        if (ruleFiles.length === 0) {
            Log.warning("No rule files (.mdc) found in prompts/rules");
            return;
        }

        Log.log(`Found ${chalk.green(ruleFiles.length.toString())} rule files: ${chalk.cyan(ruleFiles.join(", "))}`);

        // Copy each rule file
        let copiedCount = 0;
        for (const file of ruleFiles) {
            try {
                const sourcePath = join(sourceDir, file);
                const targetPath = join(targetDir, file);

                const content = readFileSync(sourcePath, "utf-8");
                writeFileSync(targetPath, content, "utf-8");

                Log.log(`✓ Copied ${chalk.green(file)}`);
                copiedCount++;
            } catch (error) {
                Log.error(`✗ Failed to copy ${file}: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }

        Log.info(
            `Successfully synced ${chalk.green(copiedCount.toString())} rule files to ${chalk.whiteBright(targetDir)}`
        );
    } catch (error) {
        Log.error(`Failed to sync rules: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
