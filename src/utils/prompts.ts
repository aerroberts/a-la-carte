import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Log } from "./logger";

export function loadPrompts(promptNames: string[]): string[] {
    const promptDir = join(dirname(__filename), "..", "..", "prompts");

    const loadedPrompts: string[] = [];

    for (const promptName of promptNames) {
        const filename = `${promptName}.md`;
        const filePath = join(promptDir, filename);

        if (!existsSync(filePath)) {
            Log.warning(`Prompt "${promptName}" not found at ${filePath}`);
            Log.log("Use 'a config list-prompts' to see available prompts");
            continue;
        }

        try {
            const content = readFileSync(filePath, "utf-8");
            loadedPrompts.push(content);
        } catch (error) {
            Log.error(`Error loading prompt "${promptName}": ${error}`);
        }
    }

    return loadedPrompts;
}

export function combinePromptsWithMessage(prompts: string[], message: string): string {
    if (prompts.length === 0) {
        return message;
    }

    const promptSection = prompts.join("\n\n---\n\n");
    return `${promptSection}\n\n---\n\n<user-request> ${message} </user-request>`;
}

export function parseResponse(response: string): string {
    const matches = response.match(/<solution>(.*?)<\/solution>/s);
    if (matches) {
        return matches[1].trim();
    }
    return response;
}
