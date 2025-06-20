import { ModelContext } from "../../intelligence/context";
import { bashInheritCurrentTerminal, bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { Log } from "../../utils/logger";

export interface AskCodexArgs {
    request?: string;
    prompts?: string[];
    freshRepo?: boolean;
}

export async function askCodexAiHandler(args: AskCodexArgs): Promise<void> {
    Log.info("Asking Codex for help");

    const context = new ModelContext()
        .addPrompts(args.prompts || [])
        .addUserRequest(args.request || "")
        .toString();

    if (args.freshRepo) {
        Log.log("Cloning fresh repository for Codex to work in");
        const aiRepoDir = await cloneFreshRepo();
        await bashInNewTerminal({
            command: `codex --full-auto "${context}"`,
            dir: aiRepoDir,
        });
        Log.log(`Codex will work in a new terminal window in ${aiRepoDir}`);
    } else {
        await bashInheritCurrentTerminal({
            command: "codex",
            parameters: ["--full-auto", context],
        });
    }
}
