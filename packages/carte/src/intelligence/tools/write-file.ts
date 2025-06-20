import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { Log } from "../../utils/logger";
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
    try {
        const absolutePath = join(process.cwd(), params.path);
        await writeFile(absolutePath, params.content);
        Log.log(`Wrote file ${chalk.whiteBright(params.path)}`);
    } catch {
        Log.warning(`Failed to write file ${chalk.whiteBright(params.path)}, ignoring`);
    }
}
