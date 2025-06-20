import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { Log } from "../../utils/logger";

export interface ListPromptsArgs {}

export async function listPromptsConfigHandler(_: ListPromptsArgs): Promise<void> {
    Log.info("Listing prompts");
    const promptDir = join(dirname(__filename), "..", "..", "..", "prompts");
    Log.log(`Prompts directory: ${chalk.whiteBright(promptDir)}`);

    const files = readdirSync(promptDir);
    const promptFiles = files.filter((file) => file.endsWith(".md"));

    if (promptFiles.length === 0) {
        Log.warning("No prompts found");
        return;
    }

    Log.log(`Available prompts: ${chalk.green(promptFiles.map((file) => file.replace(".md", "")).join(", "))}`);
}
