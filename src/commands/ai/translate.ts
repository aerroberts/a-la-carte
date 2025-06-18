import { readFile } from "node:fs/promises";
import chalk from "chalk";
import chokidar from "chokidar";
import { createPatch } from "diff";
import { glob } from "glob";
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
        if (action.source.includes("*")) {
            Log.error("Source file contains * which is not supported for non-watch mode");
            process.exit(1);
        }
        await handleAction({ config, action });
    } else {
        // Get initial content of all source files
        const globMatcher = action.source.includes("*");
        const sourceFileInitialContent: Record<string, string> = {};
        const sourceFiles = await glob(action.source);
        Log.log(`Found ${sourceFiles.length} source files to watch: ${chalk.whiteBright(sourceFiles.join(", "))}`);
        for (const sourceFile of sourceFiles) {
            sourceFileInitialContent[sourceFile] = await readFile(sourceFile, "utf-8");
        }

        // Setup watcher
        const watcher = chokidar.watch(action.source, { ignoreInitial: true });
        Log.info(
            `Watching ${chalk.whiteBright(action.source)} for changes and automatically translating to ${chalk.whiteBright(action.destination)}`
        );
        watcher.on("change", async (filePath) => {
            const newInputFile = await readFile(filePath, "utf-8");
            const diff = createPatch(action.source, sourceFileInitialContent[filePath] || "", newInputFile);
            sourceFileInitialContent[filePath] = newInputFile;
            const rootPath = filePath.split(".")[0];
            const destination = globMatcher ? rootPath + action.destination : action.destination;
            const mergedAction: TranslationAction = {
                ...action,
                source: filePath,
                destination,
            };
            Log.info(`Changed detected, performing incremental translation to ${chalk.whiteBright(destination)}`);
            await handleAction({ config, action: mergedAction, inputFileDiff: diff });
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
