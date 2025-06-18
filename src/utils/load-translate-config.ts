import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { Log } from "./logger";

export interface TranslationAction {
    source: string;
    destination: string;
    guidance: string;
    prompts?: string[];
}

export interface TranslationConfig {
    provider?: "anthropic" | "openai" | "gemini" | "openrouter";
    modelId?: string;
    actions: Record<string, TranslationAction>;
}

export function loadTranslateConfig(): TranslationConfig {
    let currentDir = process.cwd();
    const rootDir = path.parse(currentDir).root;

    while (currentDir !== rootDir) {
        const configPath = path.join(currentDir, ".carte", "translations.json");
        if (!existsSync(configPath)) {
            currentDir = path.dirname(currentDir);
            continue;
        }
        try {
            const config = JSON.parse(readFileSync(configPath, "utf8"));
            Log.log(`Loaded translations.json from ${configPath}`);
            return config;
        } catch {
            Log.warning(`Failed to parse translations.json from ${configPath}`);
            currentDir = path.dirname(currentDir);
        }
    }

    Log.error("Could not find translations.json in any parent directory, try creating a .carte/translations.json file");
    process.exit(1);
}
