import { existsSync } from "node:fs";
import { resolve } from "node:path";
import tree from "tree-node-cli";
import { FileNotFoundError } from "../../../errors";
import type { ModelContextCell_FileTree } from "../type";

export function serializeFileTree(cell: ModelContextCell_FileTree) {
    const { rootDirPath } = cell;
    const targetPath = resolve(process.cwd(), rootDirPath);
    if (!existsSync(targetPath)) {
        throw new FileNotFoundError(`File tree root path ${rootDirPath} does not exist`);
    }
    const treeContent = tree(targetPath, { maxDepth: 7, allFiles: false });
    return `## Workspace File Tree \nThis is the file tree of the workspace centered around the root directory: \`${rootDirPath}\`\n\`\`\`\n${treeContent}\n\`\`\``;
}
