import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ConfigLoadError } from "../errors";

export class StorageController {
    private workspaceRoot: string;
    private globalMetadataRoot: string;

    constructor() {
        this.workspaceRoot = process.cwd();
        this.globalMetadataRoot = join(process.env.HOME || process.env.USERPROFILE || "/", ".a-la-carte");

        // Setup local
        this.ensureDir(this.workspaceRoot, "tmp");
        this.ensureDir(this.workspaceRoot, "cache");
        this.ensureDir(this.workspaceRoot, "metadata");
        this.ensureJsonFile(this.workspaceRoot, "config.json");

        // Setup global
        this.ensureDir(this.globalMetadataRoot, "tmp");
        this.ensureDir(this.globalMetadataRoot, "cache");
        this.ensureJsonFile(this.globalMetadataRoot, "config.json");
    }

    private ensureJsonFile(root: string, file: string): void {
        const filePath = join(root, file);
        if (!existsSync(filePath)) {
            writeFileSync(filePath, "{}");
        }
    }

    private ensureDir(root: string, dir: string): void {
        const dirPath = join(root, dir);
        if (!existsSync(dirPath)) {
            mkdirSync(dirPath, { recursive: true });
        }
    }

    private loadJsonKey<T>(root: string, file: string, key: string, defaultValue?: T): T {
        const filePath = join(root, file);
        const content = readFileSync(filePath, "utf-8");
        const json = JSON.parse(content);
        const value = json[key] as T;
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new ConfigLoadError(
                    `Key ${key} not found in config and no default value provided, please set it first`
                );
            }
            return defaultValue;
        }
        return value;
    }

    private setJsonKey(root: string, file: string, key: string, value: unknown): void {
        this.ensureJsonFile(root, file);
        const filePath = join(root, file);
        const content = readFileSync(filePath, "utf-8");
        const json = JSON.parse(content);
        json[key] = value;
        writeFileSync(filePath, JSON.stringify(json, null, 2));
    }

    loadWorkspaceKey<T>(key: string, defaultValue?: T): T {
        return this.loadJsonKey(this.workspaceRoot, "config.json", key, defaultValue);
    }

    setWorkspaceKey(key: string, value: unknown): void {
        this.setJsonKey(this.workspaceRoot, "config.json", key, value);
    }

    loadGlobalKey<T>(key: string, defaultValue?: T): T {
        return this.loadJsonKey(this.globalMetadataRoot, "config.json", key, defaultValue);
    }

    setGlobalKey(key: string, value: unknown): void {
        this.setJsonKey(this.globalMetadataRoot, "config.json", key, value);
    }

    writeToTmp(content: string, extension?: string): string {
        const randomId = Math.random().toString(36).substring(2, 15);
        const tmpPath = join(this.globalMetadataRoot, "tmp", randomId + (extension || ".txt"));
        writeFileSync(tmpPath, content);
        return tmpPath;
    }
}
