import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import chalk from "chalk";
import chokidar from "chokidar";
import { createPatch } from "diff";
import { glob } from "glob";
import { invokeModel } from "../intelligence";
import { ModelContext } from "../intelligence/context";
import { bash } from "../utils/bash";
import { type CarteAction, type CarteConfig, loadCarteConfig } from "../utils/load-config";
import { Log } from "../utils/logger";

export interface RunArgs {
    action: string;
}

export async function actionHandler(args: RunArgs): Promise<void> {
    Log.info("Starting AI driven code action");

    const config = loadCarteConfig();
    const action = config.actions[args.action];

    // Find all source files
    const globMatcher = action.source.includes("*");
    const sourceFileInitialContent: Record<string, string> = {};
    const sourceFiles = await glob(action.source);
    Log.log(`Found ${sourceFiles.length} source files: ${chalk.whiteBright(sourceFiles.join(", "))}`);
    for (const sourceFile of sourceFiles) {
        sourceFileInitialContent[sourceFile] = await readFile(sourceFile, "utf-8");
    }

    if (!action) {
        Log.error(`Action ${args.action} not found in translations.json`);
    }

    if (!action.watch) {
        for (const sourceFile of sourceFiles) {
            const destination = globMatcher ? sourceFile.split(".")[0] + action.destination : action.destination;
            const mergedAction: CarteAction = {
                ...action,
                source: sourceFile,
                destination,
            };
            if (!action.ignoreMissing && !existsSync(destination)) {
                Log.warning(`Destination file ${chalk.whiteBright(destination)} does not exist, skipping translation`);
                continue;
            }
            handleAction({ config, action: mergedAction });
        }
    } else {
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
            const mergedAction: CarteAction = {
                ...action,
                source: filePath,
                destination,
            };
            if (!action.ignoreMissing && !existsSync(destination)) {
                Log.warning(`Destination file ${chalk.whiteBright(destination)} does not exist, skipping translation`);
                return;
            }
            Log.info(`Changed detected, performing incremental translation to ${chalk.whiteBright(destination)}`);
            await handleAction({ config, action: mergedAction, inputFileDiff: diff });
            Log.success("Translation complete");
        });
    }
}

interface HandleActionArgs {
    config: CarteConfig;
    action: CarteAction;
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
        .addUserRequest(`Translate the input file (${action.source}) to the output file (${action.destination})`);

    for (const bashCommand of config.context?.forFile || []) {
        const command = await bash(`export FILE_PATH=${action.source} && ${bashCommand}`);
        context.addContextForFile(action.source, bashCommand, command);
    }

    await invokeModel({
        provider: config.provider,
        modelId: config.modelId,
        inputFile: context.toFile(),
        outputFile: action.destination,
    });
}
