import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface SaveToTmpOptions {
    content: string;
    extension?: string;
}

export async function saveToTmp(options: SaveToTmpOptions): Promise<string> {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
    const tmpDir = join(homeDir, ".a-la-carte", "tmp");
    const randomId = Math.random().toString(36).substring(2, 15);
    const filePath = join(tmpDir, randomId + (options.extension || ".txt"));
    await writeFile(filePath, options.content);
    return filePath;
}
