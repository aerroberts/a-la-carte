import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import ignore from "ignore";

export interface FindClosestFilesOptions {
    targetFile: string;
    count: number;
    maxDepth?: number;
}

export interface FileDistance {
    filePath: string;
    distance: number;
    relativePath: string;
}

function createGitignoreFilter(startPath: string): ReturnType<typeof ignore> {
    const ig = ignore();

    // Find .gitignore file starting from the target path and walking up
    let currentPath = startPath;
    let foundGitignore = false;

    while (currentPath !== dirname(currentPath)) {
        const gitignorePath = join(currentPath, ".gitignore");
        if (existsSync(gitignorePath)) {
            try {
                const gitignoreContent = readFileSync(gitignorePath, "utf-8");
                ig.add(gitignoreContent);
                foundGitignore = true;
                break;
            } catch (error) {
                // Continue searching in parent directory
            }
        }
        currentPath = dirname(currentPath);
    }

    // Add minimal defaults if no .gitignore found
    if (!foundGitignore) {
        ig.add(["node_modules/", ".git/", "dist/", "build/", "coverage/"]);
    }

    return ig;
}

function isTypeScriptFile(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return ext === ".ts" || ext === ".tsx";
}

export function findClosestFiles(options: FindClosestFilesOptions): FileDistance[] {
    const { targetFile, count, maxDepth = 5 } = options;

    const targetPath = resolve(targetFile);
    const targetDir = lstatSync(targetPath).isDirectory() ? targetPath : dirname(targetPath);

    if (!existsSync(targetDir)) {
        return [];
    }

    // Create gitignore filter based on the target directory
    const ig = createGitignoreFilter(targetDir);
    const visited = new Set<string>();
    const queue: { path: string; distance: number }[] = [{ path: targetDir, distance: 0 }];
    const foundFiles: FileDistance[] = [];

    while (queue.length > 0 && foundFiles.length < count * 3) {
        // Find more than needed to sort by distance
        const current = queue.shift()!;

        if (visited.has(current.path) || current.distance > maxDepth) {
            continue;
        }

        visited.add(current.path);

        try {
            const items = readdirSync(current.path);

            for (const item of items) {
                const itemPath = join(current.path, item);
                const relativePath = relative(targetDir, itemPath);

                // Use gitignore to filter files and directories
                if (ig.ignores(relativePath)) {
                    continue;
                }

                try {
                    const stats = lstatSync(itemPath);

                    if (stats.isDirectory()) {
                        // Add directory to queue for further exploration
                        if (current.distance < maxDepth) {
                            queue.push({ path: itemPath, distance: current.distance + 1 });
                        }
                    } else if (stats.isFile()) {
                        // Only include TypeScript files and exclude the target file itself
                        if (isTypeScriptFile(itemPath) && itemPath !== targetPath) {
                            foundFiles.push({
                                filePath: itemPath,
                                distance: current.distance,
                                relativePath: relative(process.cwd(), itemPath),
                            });
                        }
                    }
                } catch (error) {
                    // Skip files/directories we can't access
                    continue;
                }
            }
        } catch (error) {
            // Skip directories we can't read
            continue;
        }

        // Also explore parent directory if we haven't reached max depth
        if (current.distance < maxDepth) {
            const parentDir = dirname(current.path);
            if (parentDir !== current.path && !visited.has(parentDir)) {
                queue.push({ path: parentDir, distance: current.distance + 1 });
            }
        }
    }

    // Sort by distance first, then by path for deterministic results
    foundFiles.sort((a, b) => {
        if (a.distance !== b.distance) {
            return a.distance - b.distance;
        }
        return a.filePath.localeCompare(b.filePath);
    });

    return foundFiles.slice(0, count);
}

export function findClosestFilesInDirectory(
    directoryPath: string,
    count: number,
    options?: Partial<FindClosestFilesOptions>
): FileDistance[] {
    const resolvedDir = resolve(directoryPath);

    if (!existsSync(resolvedDir) || !lstatSync(resolvedDir).isDirectory()) {
        return [];
    }

    return findClosestFiles({
        targetFile: resolvedDir,
        count,
        ...options,
    });
}
