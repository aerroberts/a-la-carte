import { invokeModel } from "../../intelligence";
import { ModelContext } from "../../intelligence/context";
import { Config } from "../../utils/state";

export interface InvokeArgs {
    inputFilePath: string;
    outputFilePath: string;
    prompts?: string[];
}

export async function invokeAiHandler(args: InvokeArgs): Promise<void> {
    // Build context
    const contextFile = new ModelContext()
        .addPrompts(args.prompts || [])
        .addRequestFromFile(args.inputFilePath)
        .toFile();

    // Invoke the model
    const defaultProvider = Config.loadKey<"anthropic" | "openai" | "gemini">("default-provider", "openai");
    await invokeModel(defaultProvider, contextFile, args.outputFilePath);
}
