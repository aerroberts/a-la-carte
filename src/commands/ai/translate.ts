import { readFile } from "node:fs/promises";
import chokidar from "chokidar";
import { createPatch } from "diff";
import { invokeModel } from "../../intelligence";
import { ModelContext } from "../../intelligence/context";
import { loadTranslateConfig, type TranslationAction, type TranslationConfig } from "../../utils/load-translate-config";
import { Log } from "../../utils/logger";

export interface TranslateArgs {
    action: string;
    watch?: boolean;
}

export async function translateAiHandler(args: TranslateArgs): Promise<void> {
    Log.info("Starting AI driven code translation");

    const config = loadTranslateConfig();
    const action = config.actions[args.action];

    if (!action) {
        Log.error(`Action ${args.action} not found in translations.json`);
    }

    if (!args.watch) {
        await handleAction({ config, action });
    } else {
        const watcher = chokidar.watch(action.source, { ignoreInitial: true });
        let currentInputFile = await readFile(action.source, "utf-8");
        Log.info(
            `Watching ${action.source} for changes and automatically translating it to ${action.destination} . . .`
        );
        watcher.on("change", async (filePath) => {
            const newInputFile = await readFile(filePath, "utf-8");
            const diff = createPatch(action.source, currentInputFile, newInputFile);
            currentInputFile = newInputFile;
            Log.info("Changed detected, performing incremental translation.");
            await handleAction({ config, action, inputFileDiff: diff });
            Log.success("Translation complete");
        });
    }
}

interface HandleActionArgs {
    config: TranslationConfig;
    action: TranslationAction;
    inputFileDiff?: string;
}

async function handleAction({ config, action, inputFileDiff }: HandleActionArgs) {
    const context = new ModelContext()
        .addPrompts(["translate", ...(action.prompts || [])])
        .addUserRequest(action.guidance || "")
        .addRequestFromFile(action.source)
        .addRequestFromFile(action.destination)
        .addUserRequest(
            inputFileDiff ? `I just edited the input file, here is the diff produced:\n\n ${inputFileDiff}` : ""
        )
        .addUserRequest(`Translate the input file (${action.source}) to the output file (${action.destination})`)
        .toFile();

    await invokeModel({
        provider: config.provider,
        modelId: config.modelId,
        inputFile: context,
        outputFile: action.destination,
    });
}
