import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { Log } from "./logger";

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

    private ensureTmpDir(): void {
        const dir = dirname(this.configPath);
        const tmpDir = join(dir, "tmp");
        if (!existsSync(tmpDir)) {
            mkdirSync(tmpDir, { recursive: true });
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
                Log.error(`Key ${key} not found in config and no default value provided, please set it first`);
                process.exit(1);
            }
            Log.log(`Key ${key} not found in config, using default value: ${chalk.whiteBright(defaultValue)}`);
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

    getConfigPath(): string {
        return this.configPath;
    }

    loadFullConfig(): Record<string, unknown> {
        const config = this.getConfig();
        const fullConfig = { ...config };
        return fullConfig;
    }

    writeToTmp(content: string, extension?: string): string {
        this.ensureTmpDir();
        const randomId = Math.random().toString(36).substring(2, 15);
        const dir = dirname(this.configPath);
        const tmpPath = join(dir, "tmp", randomId + (extension || ".txt"));
        writeFileSync(tmpPath, content);
        return tmpPath;
    }
}

const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
const configPath = join(homeDir, ".a-la-carte", "config.json");
export const Config = new ConfigManager(configPath);
