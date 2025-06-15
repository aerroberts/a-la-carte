import { spawn } from "node:child_process";
import { bashInNewTerminal } from "../../utils/bash-new-terminal";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { Log } from "../../utils/logger";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";

export interface AskClaudeAIArgs {
    request?: string;
    prompts?: string[];
    freshRepo?: boolean;
}

export async function askClaudeAiHander(args: AskClaudeAIArgs): Promise<void> {
    Log.info("Asking Claude Code CLI for help");

    const prompts = loadPrompts(args.prompts || []);
    const finalMessage = combinePromptsWithMessage(prompts, args.request || "");

    if (prompts.length > 0) {
        Log.log(`Using ${prompts.length} prompt(s) with your request`);
    }

    let repoDir = process.cwd();

    if (args.freshRepo) {
        Log.log("Cloning fresh repository for Claude to work in");
        repoDir = await cloneFreshRepo();
    }

    if (args.freshRepo) {
        await bashInNewTerminal({
            command: `claude --dangerously-skip-permissions "${finalMessage}"`,
            dir: repoDir,
        });
        Log.log(`Claude will work in a new terminal window in ${repoDir}`);
    } else {
        // Hand over terminal control to Claude CLI for full interactivity
        const claude = spawn("claude", ["--dangerously-skip-permissions", finalMessage], {
            env: {
                ...process.env,
            },
            cwd: repoDir,
            stdio: "inherit",
        });

        claude.on("close", (code) => {
            process.exit(code || 0);
        });

        claude.on("error", (error) => {
            Log.error(`Failed to start Claude: ${error.message}`);
            process.exit(1);
        });
    }
}
