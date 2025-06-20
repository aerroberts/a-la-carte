import { existsSync, lstatSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import ignore from "ignore";
import tree from "tree-node-cli";
import { Log } from "./logger";

export interface TreeCommandOptions {
    path: string;
    maxDepth?: number;
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

export async function generateFileTree(options: TreeCommandOptions): Promise<string> {
    const { path, maxDepth = 4 } = options;

    const targetPath = resolve(path);
    const actualPath =
        existsSync(targetPath) && lstatSync(targetPath).isDirectory() ? targetPath : resolve(targetPath, "..");

    try {
        // Create gitignore filter
        const ig = createGitignoreFilter(actualPath);

        // Use tree-node-cli with simple options (gitignore filtering will be applied by the file search utilities)
        const treeOutput = tree(actualPath, {
            maxDepth,
            allFiles: false,
        });

        return treeOutput;
    } catch (error) {
        Log.warning(`Failed to generate tree: ${error}`);
        return `Error generating tree: ${error}`;
    }
}

export function generateFileTreeForPath(path: string): Promise<string> {
    return generateFileTree({ path });
}
