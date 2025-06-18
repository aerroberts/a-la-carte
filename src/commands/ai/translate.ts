import { readFile } from "node:fs/promises";
import { readFileSync, existsSync, readdir as readdirSync } from "node:fs";
import path from "node:path";
import { glob } from "node:fs";
import chokidar from "chokidar";
import { createPatch } from "diff";
import { invokeModel } from "../../intelligence";
import { ModelContext } from "../../intelligence/context";
import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface TranslationMapping {
    source: string; // glob pattern
    destination: string; // can use environment variables
    prompt?: string; // key to existing prompt
    customPrompts?: string[]; // array of prompt keys
    customString?: string; // ad hoc prompt string
}

export interface TranslationConfig {
    modelId?: string;
    provider?: "anthropic" | "openai" | "gemini" | "openrouter";
    translationMapping: TranslationMapping[];
}

export interface TranslateArgs {
    inputFilePath?: string;
    outputFilePath?: string;
    prompts?: string[];
    watch?: boolean;
    config?: string; // path to translation config JSON file
}

// Basic glob pattern matching function
function matchesGlob(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
        .replace(/\./g, "\\.")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
}

// Expand environment variables in destination path
function expandEnvVars(destPath: string): string {
    return destPath.replace(/\$\{([^}]+)\}/g, (match, varName) => {
        return process.env[varName] || match;
    });
}

export async function translateAiHandler(args: TranslateArgs): Promise<void> {
    if (args.config) {
        await translateAiHandlerWithConfig(args);
    } else if (args.inputFilePath && args.outputFilePath) {
        if (args.watch) {
            await translateAiHandlerWatch(args);
        } else {
            await translateAiHandlerNoWatch(args);
        }
    } else {
        throw new Error("Either config file or both inputFilePath and outputFilePath must be provided");
    }
}

export async function translateAiHandlerWithConfig(args: TranslateArgs): Promise<void> {
    if (!args.config) {
        throw new Error("Config file path is required");
    }

    Log.info("Loading translation config and processing mappings");

    // Read and parse config file
    const configPath = path.resolve(args.config);
    if (!existsSync(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
    }

    const configContent = await readFile(configPath, "utf-8");
    const config: TranslationConfig = JSON.parse(configContent);

    // Process each translation mapping
    for (const mapping of config.translationMapping) {
        Log.info(`Processing mapping: ${mapping.source} -> ${mapping.destination}`);
        
        // Find files matching the source pattern
        const matchingFiles = await findMatchingFiles(mapping.source, path.dirname(configPath));
        
        for (const sourceFile of matchingFiles) {
            // Generate destination file path
            const destFile = expandEnvVars(mapping.destination);
            
            // Build context with prompts
            const contextBuilder = new ModelContext();
            
            // Add default translate prompt
            if (mapping.prompt) {
                contextBuilder.addPrompts([mapping.prompt]);
            } else {
                contextBuilder.addPrompts(["translate"]);
            }
            
            // Add custom prompts if specified
            if (mapping.customPrompts && mapping.customPrompts.length > 0) {
                contextBuilder.addPrompts(mapping.customPrompts);
            }
            
            // Add files to context
            contextBuilder
                .addRequestFromFile(sourceFile)
                .addRequestFromFile(destFile);
            
            // Add custom string prompt if provided
            if (mapping.customString) {
                contextBuilder.addUserRequest(mapping.customString);
            }
            
            // Add final translation request
            contextBuilder.addUserRequest(`Translate the input file (${sourceFile}) to the output file (${destFile})`);
            
            const contextFile = contextBuilder.toFile();

            // Determine provider and model
            const provider = config.provider || Config.loadKey<"anthropic" | "openai" | "gemini" | "openrouter">(
                "default-provider",
                "openai"
            );
            
            // Invoke the model with specific modelId if provided
            if (config.modelId) {
                // Store current model temporarily if needed
                const currentModel = Config.loadKey("openrouter-model", "");
                if (provider === "openrouter" && currentModel !== config.modelId) {
                    Config.setKey("openrouter-model", config.modelId);
                }
            }
            
            await invokeModel(provider, contextFile, destFile);
            Log.success(`Translation complete: ${sourceFile} -> ${destFile}`);
        }
    }
    
    Log.success("All translation mappings processed");
}

async function findMatchingFiles(pattern: string, basePath: string): Promise<string[]> {
    // Simple implementation - in a production environment, you might want to use a proper glob library
    const matchingFiles: string[] = [];
    
    try {
        // If pattern is a specific file, check if it exists
        if (!pattern.includes("*") && !pattern.includes("?")) {
            const fullPath = path.resolve(basePath, pattern);
            if (existsSync(fullPath)) {
                matchingFiles.push(fullPath);
            }
            return matchingFiles;
        }
        
        // For glob patterns, we'll need to implement a basic file finder
        // This is a simplified implementation - consider adding a proper glob library like 'glob' or 'fast-glob'
        const { readdir } = await import("node:fs/promises");
        
        async function searchDirectory(dir: string): Promise<void> {
            try {
                const entries = await readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        // Recursively search subdirectories for patterns with **
                        if (pattern.includes("**")) {
                            await searchDirectory(fullPath);
                        }
                    } else if (entry.isFile()) {
                        // Check if file matches pattern
                        const relativePath = path.relative(basePath, fullPath);
                        if (matchesGlob(relativePath, pattern) || matchesGlob(entry.name, pattern)) {
                            matchingFiles.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Ignore directories we can't read
            }
        }
        
        await searchDirectory(basePath);
    } catch (error) {
        Log.warning(`Error finding files for pattern ${pattern}: ${error}`);
    }
    
    return matchingFiles;
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
