import { invokeModel } from "../../intelligence";
import { ModelContext } from "../../intelligence/context";

export interface InvokeArgs {
    inputFilePath: string;
    outputFilePath: string;
    guidance?: string;
    prompts?: string[];
}

export async function invokeAiHandler(args: InvokeArgs): Promise<void> {
    await invokeModel({
        inputFile: new ModelContext()
            .addPrompts(args.prompts || [])
            .addRequestFromFile(args.inputFilePath)
            .addUserRequest(args.guidance || "")
            .toFile(),
        outputFile: args.outputFilePath,
    });
}
