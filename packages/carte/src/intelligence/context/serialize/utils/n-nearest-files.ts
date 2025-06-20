import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import ignore from "ignore";
import { Log } from "../../../../utils/logger";

export function findNNearestFiles(targetPath: string, n = 10): string[] {
    const targetDir = dirname(targetPath);
    const targetExt = extname(targetPath);
    const ig = createIgnoreMatcher(targetDir);

    const pathsToConsider: string[] = [targetDir];
    const pathsSearched = new Set<string>();
    const validFiles: string[] = [];

    while (pathsToConsider.length > 0 && validFiles.length < n) {
        const currentPath = pathsToConsider.shift();
        if (!currentPath) {
            break;
        }

        if (pathsSearched.has(currentPath)) {
            continue;
        }

        pathsSearched.add(currentPath);

        // Check if path should be ignored
        const relativePath = relative(process.cwd(), currentPath);
        if (!relativePath) {
            continue;
        }
        if (ig.ignores(relativePath) || relativePath.split("/").some((part) => part.startsWith("."))) {
            continue;
        }

        if (!currentPath.startsWith(targetDir)) {
            continue;
        }

        try {
            const stats = statSync(currentPath);

            if (stats.isDirectory()) {
                // Add parent directory
                const parentDir = dirname(currentPath);
                if (parentDir !== currentPath && !pathsSearched.has(parentDir)) {
                    pathsToConsider.push(parentDir);
                }

                // Add siblings and children
                const dirItems = readdirSync(currentPath);
                for (const item of dirItems) {
                    const fullPath = join(currentPath, item);
                    if (!pathsSearched.has(fullPath)) {
                        pathsToConsider.push(fullPath);
                    }
                }
            } else {
                // It's a file, check if it's valid
                const extension = extname(currentPath);
                if (extension === targetExt || validFiles.length < n) {
                    validFiles.push(currentPath);
                }
            }
        } catch {}
    }

    // Sort by relevance (same extension first, then alphabetically)
    validFiles.sort((a, b) => {
        const extA = extname(a);
        const extB = extname(b);

        if (extA === targetExt && extB !== targetExt) return -1;
        if (extB === targetExt && extA !== targetExt) return 1;
        return a.localeCompare(b);
    });

    Log.log(`Found ${validFiles.length} files nearby to ${targetPath}`);

    return validFiles.slice(0, n);
}

function createIgnoreMatcher(baseDir: string) {
    const ig = ignore();

    let currentDir = join(process.cwd(), baseDir);
    let gitignorePath: string | null = null;

    while (currentDir !== dirname(currentDir)) {
        const potentialGitignore = join(currentDir, ".gitignore");
        if (existsSync(potentialGitignore)) {
            gitignorePath = potentialGitignore;
            break;
        }
        currentDir = dirname(currentDir);
    }

    if (gitignorePath) {
        try {
            const content = readFileSync(gitignorePath, "utf8");
            ig.add(content);
        } catch {}
    }

    return ig;
}
