import { readdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function paths(path: string): Promise<{ dirPath: string; filePath: string }> {
    const stats = await stat(path);

    if (stats.isDirectory()) {
        const files = await readdir(path);
        const firstFile = files.find((file) => !file.startsWith("."));
        if (!firstFile) {
            throw new Error(`No files found in directory: ${path}`);
        }
        return {
            dirPath: path,
            filePath: join(path, firstFile),
        };
    }

    return {
        dirPath: dirname(path),
        filePath: path,
    };
}
