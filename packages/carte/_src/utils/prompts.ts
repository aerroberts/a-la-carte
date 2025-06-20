import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Log } from "./logger";

export function loadPrompt(promptName: string): string {
    const promptDir = join(dirname(__filename), "..", "..", "prompts");
    const filename = `${promptName}.md`;
    const filePath = join(promptDir, filename);

    if (!existsSync(filePath)) {
        Log.warning(`Prompt "${promptName}" not found at ${filePath}`);
        Log.log("Use 'a config list-prompts' to see available prompts");
        return "";
    }

    try {
        return readFileSync(filePath, "utf-8");
    } catch (error) {
        Log.error(`Error loading prompt "${promptName}": ${error}`);
        return "";
    }
}
