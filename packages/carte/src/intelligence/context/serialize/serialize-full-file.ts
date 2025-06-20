import { readFile } from "node:fs/promises";
import { Log } from "../../../utils/logger";
import type { ModelContextCell_FullFile } from "../type";

export async function serializeFullFile(cell: ModelContextCell_FullFile) {
    const { filePath } = cell;
    const fileContent = await readFile(filePath, "utf-8");
    return `## File Content of: ${filePath} \n\n\`\`\`\n${fileContent}\n\`\`\``;
}
