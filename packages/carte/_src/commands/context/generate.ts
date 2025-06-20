import { existsSync, lstatSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { ModelContext } from "../../intelligence/context";
import { generateFileScaffold } from "../../intelligence/context/file-scaffold";
import { findClosestFiles, findClosestFilesInDirectory } from "../../utils/find-closest-files";
import { Log } from "../../utils/logger";
import { generateFileTreeForPath } from "../../utils/tree-command";

export interface GenerateContextArgs {
    inputPath: string;
    outputPath: string;
    prompts?: string[];
    guidance?: string;
    fullContextCount?: number;
    scaffoldCount?: number;
}

export async function generateContextHandler(args: GenerateContextArgs): Promise<void> {
    Log.info(`Generating context for ${args.inputPath}`);

    const inputPath = resolve(args.inputPath);
    const outputPath = resolve(args.outputPath);

    if (!existsSync(inputPath)) {
        throw new Error(`Input path does not exist: ${inputPath}`);
    }

    const context = new ModelContext();

    // Add prompts if provided
    if (args.prompts && args.prompts.length > 0) {
        context.addPrompts(args.prompts);
    }

    // Add guidance if provided
    if (args.guidance) {
        context.addUserRequest(args.guidance);
    }

    // Generate file tree
    const fileTree = await generateFileTreeForPath(inputPath);
    context.addContextSection("File Tree", "file-tree", fileTree);

    // Check if input is a file or directory
    const isDirectory = lstatSync(inputPath).isDirectory();

    const fullContextCount = args.fullContextCount || 10;
    const scaffoldCount = args.scaffoldCount || 50;

    if (isDirectory) {
        await generateDirectoryContext(inputPath, context, fullContextCount, scaffoldCount);
    } else {
        await generateFileContext(inputPath, context, fullContextCount, scaffoldCount);
    }

    // Write the context to the output file
    const contextString = context.toString();
    writeFileSync(outputPath, contextString, "utf-8");

    Log.success(`Context generated and written to ${outputPath}`);
}

async function generateFileContext(
    filePath: string,
    context: ModelContext,
    fullContextCount: number,
    scaffoldCount: number
): Promise<void> {
    // Add the main file content first
    const fileContent = readFileSync(filePath, "utf-8");
    const relativePath = relative(process.cwd(), filePath);
    context.addContextSection(`Main File: ${relativePath}`, "main-file", fileContent);

    // Find closest files using breadth-first search
    const closestFiles = findClosestFiles({
        targetFile: filePath,
        count: fullContextCount + scaffoldCount,
        maxDepth: 5,
    });

    Log.log(`Found ${closestFiles.length} nearby files`);

    // Process files for full context (closest files)
    const fullContextFiles = closestFiles.slice(0, fullContextCount);
    for (const fileInfo of fullContextFiles) {
        const content = readFileSync(fileInfo.filePath, "utf-8");
        Log.log(`Full Context: ${fileInfo.relativePath} (distance: ${fileInfo.distance})`);
        context.addContextSection(
            `Full Context: ${fileInfo.relativePath} (distance: ${fileInfo.distance})`,
            "full-context",
            content
        );
    }

    // Process files for scaffold context (further files)
    const scaffoldFiles = closestFiles.slice(fullContextCount, fullContextCount + scaffoldCount);
    for (const fileInfo of scaffoldFiles) {
        const scaffold = generateFileScaffold(fileInfo.filePath);
        console.log({ scaffold, path: fileInfo.filePath });
        if (scaffold) {
            Log.log(`Scaffold: ${fileInfo.relativePath} (distance: ${fileInfo.distance})`);
            context.addContextSection(
                `Scaffold: ${fileInfo.relativePath} (distance: ${fileInfo.distance})`,
                "scaffold",
                scaffold
            );
        }
    }
}

async function generateDirectoryContext(
    dirPath: string,
    context: ModelContext,
    fullContextCount: number,
    scaffoldCount: number
): Promise<void> {
    // Find files in directory using breadth-first search
    const closestFiles = findClosestFilesInDirectory(dirPath, fullContextCount + scaffoldCount, {
        maxDepth: 3,
    });

    Log.log(`Found ${closestFiles.length} files in directory`);

    // Process files for full context (first N files)
    const fullContextFiles = closestFiles.slice(0, fullContextCount);
    for (const fileInfo of fullContextFiles) {
        const scaffold = generateFileScaffold(fileInfo.filePath);
        if (scaffold) {
            context.addContextSection(`Full Context: ${fileInfo.relativePath}`, "full-context", scaffold);
        }
    }

    // Process files for scaffold context (remaining files)
    const scaffoldFiles = closestFiles.slice(fullContextCount, fullContextCount + scaffoldCount);
    for (const fileInfo of scaffoldFiles) {
        const scaffold = generateFileScaffold(fileInfo.filePath);
        if (scaffold) {
            context.addContextSection(`Scaffold: ${fileInfo.relativePath}`, "scaffold", scaffold);
        }
    }
}
