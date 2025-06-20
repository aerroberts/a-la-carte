import { Log } from "../../../utils/logger";
import type { ModelContextCell_FileScaffold } from "../type";
import { generateFileScaffold } from "./utils/file-scaffold";

export async function serializeFileScaffold(cell: ModelContextCell_FileScaffold) {
    const { filePath } = cell;
    if (filePath.endsWith(".ts")) {
        const fileContent = generateFileScaffold(filePath);
        if (!fileContent) {
            Log.warning(`No scaffold available for ${filePath}, skipping`);
            return "";
        }
        return `## File Scaffold of: ${filePath} \n\nThis is a scaffold of all the public API of the file. Its not a complete file, but it should give you a good idea of what the file is about. \n\`\`\`\n${fileContent}\n\`\`\``;
    }
    return "";
}
