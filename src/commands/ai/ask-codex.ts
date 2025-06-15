import chalk from "chalk";
import { bashInheritCurrentTerminal, bashInNewTerminal } from "../../utils/bash";
import { cloneFreshRepo } from "../../utils/clone-repo";
import { Log } from "../../utils/logger";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";

export interface AskCodexArgs {
    request?: string;
    prompts?: string[];
    freshRepo?: boolean;
}

export async function askCodexAiHandler(args: AskCodexArgs): Promise<void> {
    Log.info("Asking Codex for help");

    const prompts = loadPrompts(args.prompts || []);
    const finalMessage = combinePromptsWithMessage(prompts, args.request || "");

    if (prompts.length > 0) {
        console.log(chalk.green(`Using ${prompts.length} prompt(s) with your request`));
    }

    if (args.freshRepo) {
        Log.log("Cloning fresh repository for Codex to work in");
        const aiRepoDir = await cloneFreshRepo();
        await bashInNewTerminal({
            command: `codex --full-auto "${finalMessage}"`,
            dir: aiRepoDir,
        });
        Log.log(`Codex will work in a new terminal window in ${aiRepoDir}`);
    } else {
        await bashInheritCurrentTerminal({
            command: "codex",
            parameters: ["--full-auto", finalMessage],
        });
    }
}
