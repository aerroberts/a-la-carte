import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { Log } from "./logger";

export interface CarteAction {
    watch?: boolean;
    ignoreMissing?: boolean;
    source: string;
    destination: string;
    guidance: string;
    prompts?: string[];
}

export interface CarteConfig {
    provider?: "anthropic" | "openai" | "gemini" | "openrouter";
    modelId?: string;
    actions: Record<string, CarteAction>;
    context?: {
        forFile: string[];
    };
}

export function loadCarteConfig(): CarteConfig {
    let currentDir = process.cwd();
    const rootDir = path.parse(currentDir).root;

    while (currentDir !== rootDir) {
        const configPath = path.join(currentDir, ".carte", "config.json");
        if (!existsSync(configPath)) {
            currentDir = path.dirname(currentDir);
            continue;
        }
        try {
            const config = JSON.parse(readFileSync(configPath, "utf8"));
            Log.log(`Loaded config.json from ${configPath}`);
            return config;
        } catch {
            Log.warning(`Failed to parse config.json from ${configPath}`);
            currentDir = path.dirname(currentDir);
        }
    }

    Log.error("Could not find config.json in any parent directory, try creating a .carte/config.json file");
    process.exit(1);
}
