import { Storage } from "../..";
import { ModelContext } from "../../intelligence/context/context";
import { invokeModel } from "../../intelligence/invoke-model";
import { paths } from "../../utils/files";

export interface InvokeAiArgs {
    inputContext: string;
    outputFile: string;
    guidance?: string;
    prompts?: string[];
}

export async function invokeAiHandler(args: InvokeAiArgs): Promise<void> {
    const { dirPath, filePath } = await paths(args.inputContext);

    const context = await new ModelContext()
        .addSection("Workspace Structure", "Here is the structure of the workspace.")
        .addFileTree(dirPath)
        .addSection("Relevant File Scaffolds", "Here are some file details that are useful to the current task.")
        .addNearbyFileScaffolds("Relevant File Scaffolds", filePath, 10)
        .addNearbyFullFiles("Relevant File Contents", filePath, 5)
        .addIncludedPrompts(args.prompts || [])
        .compile();

    const file = await Storage.writeToTmp(context);

    await invokeModel({
        inputFile: file,
        outputFile: args.outputFile,
    });
}
