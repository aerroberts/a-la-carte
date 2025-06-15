import { bashInheritCurrentTerminal, bashInNewTerminal } from "../../utils/bash";
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

    if (args.freshRepo) {
        Log.log("Cloning fresh repository for Claude to work in");
        const repoDir = await cloneFreshRepo();
        await bashInNewTerminal({
            command: `claude --dangerously-skip-permissions "${finalMessage}"`,
            dir: repoDir,
        });
        Log.log(`Claude will work in a new terminal window in ${repoDir}`);
    } else {
        await bashInheritCurrentTerminal({
            command: "claude",
            parameters: ["--dangerously-skip-permissions", finalMessage],
        });
    }
}
