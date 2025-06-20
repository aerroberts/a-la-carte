import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelProviderTool } from "../provider";

export const writeFileTool: ModelProviderTool = {
    name: "write-file",
    description: "Rewrites the entire contents of a file to the workspace",
    parameters: {
        path: { type: "string", description: "The path to the file to write" },
        content: { type: "string", description: "The new content to write to the file" },
    },
};

export async function writeFileHandler(params: { path: string; content: string }) {
    const absolutePath = join(process.cwd(), params.path);
    await writeFile(absolutePath, params.content);
}
