import { Storage } from "../..";
import { ModelContext } from "../../intelligence/context/context";
import { invokeModel } from "../../intelligence/invoke-model";
import { paths } from "../../utils/files";

export interface InvokeAiArgs {
    inputContext: string;
    prompts?: string[];
    tools?: string[];
    guidance?: string;
    commands?: string[];

    numFullFiles: number;
    numScaffoldFiles: number;
}

export async function invokeAiHandler(args: InvokeAiArgs): Promise<void> {
    const { dirPath, filePath } = await paths(args.inputContext);

    const context = await new ModelContext()
        .addSection("Workspace Structure", "Here is the structure of the workspace.")
        .addFileTree(dirPath)
        .addSection("Relevant File Scaffolds", "Here are some file details that are useful to the current task.")
        .addNearbyFileScaffolds("Relevant File Scaffolds", filePath, args.numScaffoldFiles)
        .addNearbyFullFiles("Relevant File Contents", filePath, args.numFullFiles)
        .addCommandFiles("Relevant Command Outputs", filePath, args.commands || [], args.numFullFiles)
        .addSection(
            "Steering Guidance",
            "Below is the guidance for the task you are performing. Its general information from the user to pay attention to"
        )
        .addIncludedPrompts(args.prompts || [])
        .addSection(
            "User Request",
            "Below is the specific task details from the user. Pay attention to these details and use them to guide your response."
        )
        .addUserRequest(args.guidance || "Follow the request in the steering guidance.")
        .compile();

    const file = await Storage.writeToTmp(context);
    await invokeModel({ inputFile: file, tools: args.tools || ["write-file"] });
}
