import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

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

    loadKey<T>(key: string, defaultValue?: T): T {
        const config = this.getConfig();
        const value = config[key] as T;
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Key ${key} not found in config and no default value provided, please set it first`);
            }
            return defaultValue;
        }
        return value;
    }

    setKey(key: string, value: unknown): void {
        const config = this.getConfig();
        config[key] = value;
        this.ensureConfigDir();
        writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    }
}

const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
const configPath = join(homeDir, ".a-la-carte", "config.json");
export const Config = new ConfigManager(configPath);
