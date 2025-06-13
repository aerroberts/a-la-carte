import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export class ConfigManager {
    private configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    private ensureConfigDir(): void {
        const dir = dirname(this.configPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }

    private getConfig(): Record<string, unknown> {
        try {
            if (existsSync(this.configPath)) {
                const content = readFileSync(this.configPath, "utf-8");
                return JSON.parse(content);
            }
            return {};
        } catch {
            console.warn("Failed to load config, using an empty config as fallback");
            return {};
        }
    }

    private saveConfig(): void {
        this.ensureConfigDir();
        writeFileSync(this.configPath, JSON.stringify(this.getConfig(), null, 2));
    }

    loadKey<T>(key: string, defaultValue: T): T {
        const config = this.getConfig();
        return (config[key] as T) ?? defaultValue;
    }

    setKey(key: string, value: unknown): void {
        const config = this.getConfig();
        config[key] = value;
        this.saveConfig();
    }
}

export const Config = new ConfigManager("~/.a-la-carte/config.json");
