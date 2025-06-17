import { invokeModel } from "../../intelligence";
import { ModelContext } from "../../intelligence/context";
import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface TranslateArgs {
    inputFilePath: string;
    outputFilePath: string;
    prompts?: string[];
}

export async function translateAiHandler(args: TranslateArgs): Promise<void> {
    Log.info("Translating the input file to the output file");

    // Build context
    const contextFile = new ModelContext()
        .addPrompts(["translate", ...(args.prompts || [])])
        .addRequestFromFile(args.inputFilePath)
        .addRequestFromFile(args.outputFilePath)
        .addUserRequest(`Translate the input file (${args.inputFilePath}) to the output file (${args.outputFilePath})`)
        .toFile();

    // Invoke the model
    const defaultProvider = Config.loadKey<"anthropic" | "openai" | "gemini">("default-provider", "openai");
    await invokeModel(defaultProvider, contextFile, args.outputFilePath);

    Log.success("Translation complete");
}
