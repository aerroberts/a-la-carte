import { ModelContext } from "../../intelligence/context";
import { bashInheritCurrentTerminal, bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { Log } from "../../utils/logger";

export interface AskClaudeAIArgs {
    request?: string;
    prompts?: string[];
    freshRepo?: boolean;
}

export async function askClaudeAiHander(args: AskClaudeAIArgs): Promise<void> {
    Log.info("Asking Claude Code CLI for help");

    const context = new ModelContext()
        .addPrompts(args.prompts || [])
        .addUserRequest(args.request || "")
        .toString();

    if (args.freshRepo) {
        Log.log("Cloning fresh repository for Claude to work in");
        const repoDir = await cloneFreshRepo();
        await bashInNewTerminal({
            command: `claude --dangerously-skip-permissions "${context}"`,
            dir: repoDir,
        });
        Log.log(`Claude will work in a new terminal window in ${repoDir}`);
    } else {
        await bashInheritCurrentTerminal({
            command: "claude",
            parameters: ["--dangerously-skip-permissions", context],
        });
    }
}
