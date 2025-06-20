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
    Log.log(`Writing file ${chalk.whiteBright(params.path)}`);
    const absolutePath = join(process.cwd(), params.path);
    await writeFile(absolutePath, params.content);
}
