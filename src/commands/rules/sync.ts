import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";
import { extractContentFromPath } from "../../utils/files";
import { Config } from "../../utils/state";

interface RuleSyncResult {
    cursorRules: Record<string, string>;
}

export class RuleSyncCommand implements CommandRegistration {
    name = "sync";
    description =
        "Syncs the natural language rules from the configured source into the current environment";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .action(async () => {
                await this.syncRules();
            });
    }

    private async syncRules(): Promise<void> {
        const src = Config.loadKey("rule-src", "https://github.com/a-la-carte/rules.git");
        console.log(chalk.green(`Syncing rules from ${chalk.whiteBright(src)} . . .`));

        const { cursorRules } = await this.extractRepoMetadata(src);
        await this.setupCursorRules(cursorRules);
    }

    private async extractRepoMetadata(src: string): Promise<RuleSyncResult> {
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const tempDir = join(homeDir, ".a-la-carte", "temp", "rules");
        if (existsSync(tempDir)) {
            await bash(`rm -rf ${tempDir}`);
        }
        await bash(`mkdir -p ${tempDir}`);
        await bash(`git clone ${src} ${tempDir}`);

        return { cursorRules: extractContentFromPath(join(tempDir, "cursor-rules")) }
    }

    private async setupCursorRules(cursorRules: Record<string, string>): Promise<void> {
        const cursorRulesDir = join(process.cwd(), ".cursor", "rules");
        if (!existsSync(cursorRulesDir)) {
            mkdirSync(cursorRulesDir, { recursive: true });
        }

        for (const [fileName, content] of Object.entries(cursorRules)) {
            const targetPath = join(cursorRulesDir, fileName);
            writeFileSync(targetPath, content);
            console.log(chalk.gray(`- synced cursor rule: ${chalk.whiteBright(fileName)}`));
        }
        console.log(chalk.green("Successfully synced all cursor rules!"));
    }
}
