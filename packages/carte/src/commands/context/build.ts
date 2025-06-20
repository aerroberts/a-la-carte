import { writeFile } from "node:fs/promises";
import chalk from "chalk";
import { ModelContext } from "../../intelligence/context/context";
import { paths } from "../../utils/files";
import { Log } from "../../utils/logger";

export interface BuildContextArgs {
    target: string;
    outputFile: string;
    prompts: string[];
}

export async function buildContextHandler(args: BuildContextArgs) {
    const { dirPath, filePath } = await paths(args.target);
    Log.log(`Building context for ${chalk.whiteBright(args.target)}`);

    const context = await new ModelContext()
        .addSection("Workspace Structure", "Here is the structure of the workspace.")
        .addFileTree(dirPath)
        .addSection("Relevant File Scaffolds", "Here are some file details that are useful to the current task.")
        .addNearbyFileScaffolds("Relevant File Scaffolds", filePath, 10)
        .addNearbyFullFiles("Relevant File Contents", filePath, 5)
        .addIncludedPrompts(args.prompts)
        .compile();

    await writeFile(args.outputFile, context, "utf-8");
    Log.log(`Context written to ${chalk.whiteBright(args.outputFile)}`);
}
