import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";
import { extractContentFromPath } from "../../utils/files";
import { Config } from "../../utils/state";

interface ConfigSyncResult {
    cursorRules: Record<string, string>;
    prompts: Record<string, string>;
    githubWorkflows: Record<string, string>;
}

export class ConfigSyncCommand implements CommandRegistration {
    name = "sync";
    description = "Syncs the config rules and prompts from the configured source into the current environment";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .action(async () => {
                await this.syncConfig();
            });
    }

    private async syncConfig(): Promise<void> {
        const src = Config.loadKey("config-src", "");
        console.log(chalk.green(`Syncing config from ${chalk.whiteBright(src)} . . .`));

        if (!src) {
            console.log(chalk.red("No config source configured. Please set a config source using:"));
            console.log(chalk.whiteBright("  a config set-source <url>"));
            process.exit(1);
        }

        const { cursorRules, prompts, githubWorkflows } = await this.extractRepoMetadata(src as string);
        await this.setupCursorRules(cursorRules);
        await this.setupPrompts(prompts);
        await this.setupGithubWorkflows(githubWorkflows);
    }

    private async extractRepoMetadata(src: string): Promise<ConfigSyncResult> {
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const tempDir = join(homeDir, ".a-la-carte", "tmp", "config");
        if (existsSync(tempDir)) {
            await bash(`rm -rf ${tempDir}`);
        }
        await bash(`mkdir -p ${tempDir}`);
        await bash(`git clone ${src} ${tempDir}`);

        const cursorRules = extractContentFromPath(join(tempDir, "cursor-rules"));
        const prompts = extractContentFromPath(join(tempDir, "prompts"));
        const githubWorkflows = extractContentFromPath(join(tempDir, ".github", "workflows"));

        return { cursorRules, prompts, githubWorkflows };
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

    private async setupPrompts(prompts: Record<string, string>): Promise<void> {
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
        const promptsDir = join(homeDir, ".a-la-carte", "prompts");
        if (!existsSync(promptsDir)) {
            mkdirSync(promptsDir, { recursive: true });
        }

        for (const [fileName, content] of Object.entries(prompts)) {
            const targetPath = join(promptsDir, fileName);
            writeFileSync(targetPath, content);
            console.log(chalk.gray(`- synced prompt: ${chalk.whiteBright(fileName)}`));
        }
        console.log(chalk.green("Successfully synced all prompts!"));
    }

    private async setupGithubWorkflows(githubWorkflows: Record<string, string>): Promise<void> {
        const githubWorkflowsDir = join(process.cwd(), ".github", "workflows");
        if (!existsSync(githubWorkflowsDir)) {
            mkdirSync(githubWorkflowsDir, { recursive: true });
        }

        for (const [fileName, content] of Object.entries(githubWorkflows)) {
            const targetPath = join(githubWorkflowsDir, fileName);
            writeFileSync(targetPath, content);
            console.log(chalk.gray(`- synced github workflow: ${chalk.whiteBright(fileName)}`));
        }
        console.log(chalk.green("Successfully synced all github workflows!"));
    }
}
