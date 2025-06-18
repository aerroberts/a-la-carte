import { readFile } from "node:fs/promises";
import chokidar from "chokidar";
import { createPatch } from "diff";
import { invokeModel } from "../../intelligence";
import { ModelContext } from "../../intelligence/context";
import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface TranslateArgs {
    inputFilePath: string;
    outputFilePath: string;
    prompts?: string[];
    watch?: boolean;
}

export async function translateAiHandler(args: TranslateArgs): Promise<void> {
    if (args.watch) {
        await translateAiHandlerWatch(args);
    } else {
        await translateAiHandlerNoWatch(args);
    }
}

export async function translateAiHandlerNoWatch(args: TranslateArgs): Promise<void> {
    Log.info("Translating the input file to the output file");

    // Build context
    const contextFile = new ModelContext()
        .addPrompts(["translate", ...(args.prompts || [])])
        .addRequestFromFile(args.inputFilePath)
        .addRequestFromFile(args.outputFilePath)
        .addUserRequest(`Translate the input file (${args.inputFilePath}) to the output file (${args.outputFilePath})`)
        .toFile();

    // Invoke the model
    const defaultProvider = Config.loadKey<"anthropic" | "openai" | "gemini" | "openrouter">(
        "default-provider",
        "openai"
    );
    await invokeModel(defaultProvider, contextFile, args.outputFilePath);

    Log.success("Translation complete");
}

export async function translateAiHandlerWatch(args: TranslateArgs): Promise<void> {
    Log.info("Watching the input file and automatically translating it to the output file");

    let currentInputFile = await readFile(args.inputFilePath, "utf-8");
    const watcher = chokidar.watch(args.inputFilePath, { ignoreInitial: true });

    watcher.on("change", async (filePath) => {
        const newInputFile = await readFile(filePath, "utf-8");
        const diff = createPatch(args.inputFilePath, currentInputFile, newInputFile);
        currentInputFile = newInputFile;
        const contextFile = new ModelContext()
            .addPrompts(["translate", ...(args.prompts || [])])
            .addRequestFromFile(args.inputFilePath)
            .addRequestFromFile(args.outputFilePath)
            .addUserRequest(`I just edited the input file, here is the diff:\n\n ${diff}`)
            .addUserRequest(
                `Translate the input file (${args.inputFilePath}) to the output file (${args.outputFilePath})`
            )
            .toFile();

        const defaultProvider = Config.loadKey<"anthropic" | "openai" | "gemini" | "openrouter">(
            "default-provider",
            "openai"
        );
        await invokeModel(defaultProvider, contextFile, args.outputFilePath);
        Log.info("Incremental translation complete");
    });
}
