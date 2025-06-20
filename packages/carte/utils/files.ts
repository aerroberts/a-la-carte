import fs from "node:fs";
import { join } from "node:path";

export function extractContentFromPath(path: string): Record<string, string> {
    const files: Record<string, string> = {};

    if (fs.existsSync(path)) {
        const fileNames = fs.readdirSync(path);
        for (const fileName of fileNames) {
            const filePath = join(path, fileName);
            if (fs.statSync(filePath).isFile()) {
                files[fileName] = fs.readFileSync(filePath, "utf-8");
            }
        }
    }

    return files;
}
