#!/usr/bin/env node

import { Command } from "commander";
import { invokeAiHandler } from "./commands/ai/invoke";
import { shoveCodeHandler } from "./commands/code/shove";
import { codeWatchHandler } from "./commands/code/watch";
import { buildContextHandler } from "./commands/context/build";
import { runHandler } from "./commands/run";
import { StorageController } from "./controllers/storage-controller";
import { Log } from "./utils/logger";

export const Storage = new StorageController();

/**
 * Wraps commands with error handling and logging
 */
async function wrapCommand(message: string, command: () => Promise<void>): Promise<void> {
    try {
        Log.info(message);
        await command();
        Log.success("Done!");
    } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        Log.error(`Error: ${errorInstance.message}`);
        Log.log(errorInstance.stack ?? "No stack trace available");
    }
}

/**
 * Main CLI entry point
 */
function main() {
    const program = new Command();

    program.name("a-la-carte").description("A developer's toolbox").version("0.0.1");

    // Create command groups
    const code = program.command("code").description("Coding related utilities");
    const config = program.command("config").description("Config rules and prompts management");
    const ai = program.command("ai").description("AI related utilities");
    const context = program.command("context").description("Context generation utilities");

    // Code commands
    code.command("watch")
        .description("Watch for changes and run a command")
        .argument("<pattern>", "Pattern to watch")
        .argument("<command>", "Command to run")
        .action((pattern, command) => wrapCommand("Starting watch...", () => codeWatchHandler({ pattern, command })));

    code.command("shove")
        .description("Force pushes your local changes to the remote repository")
        .argument("[message]", "The message to commit with")
        .action((message?: string) => wrapCommand("Force pushing changes...", () => shoveCodeHandler({ message })));

    // Context commands
    context
        .command("build")
        .description("Build a context file")
        .argument("<target>", "The target directory to build the context for")
        .argument("<output-file>", "The file to write the context to")
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the prompts folder",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .option("-f, --num-full-files <number>", "The number of full files to include", "5")
        .option("-s, --num-scaffold-files <number>", "The number of nearby files to include for scaffolding", "10")
        .option(
            "-c, --commands <command>",
            "The command to run",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .action((target, outputFile, options) =>
            wrapCommand("Building context...", () =>
                buildContextHandler({
                    target,
                    outputFile,
                    prompts: options.prompt,
                    numFullFiles: options.numFullFiles,
                    numScaffoldFiles: options.numScaffoldFiles,
                    commands: options.commands,
                })
            )
        );

    // Run command
    program
        .command("run")
        .description("Run a command")
        .argument("<action>", "The action to run")
        .action((action) => wrapCommand(`Running action '${action}'...`, () => runHandler({ action })));

    // AI commands
    ai.command("invoke")
        .description("Invoke an AI model")
        .argument("<input-context>", "The file or folder to use as input context")
        .argument("<output-file>", "The file to write the output to")
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the prompts folder",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .option("-g, --guidance <guidance>", "The guidance to use for the AI model")
        .option(
            "-c, --commands <command>",
            "The command to run",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .option(
            "-t, --tools <tool>",
            "The tool to use",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .option("-f, --num-full-files <number>", "The number of full files to include", "5")
        .option("-s, --num-scaffold-files <number>", "The number of nearby files to include for scaffolding", "10")
        .action((inputContext, options) =>
            wrapCommand("Invoking AI model...", () =>
                invokeAiHandler({
                    inputContext,
                    prompts: options.prompt,
                    guidance: options.guidance,
                    commands: options.commands,
                    tools: options.tools,
                    numFullFiles: options.numFullFiles,
                    numScaffoldFiles: options.numScaffoldFiles,
                })
            )
        );

    // Parse the arguments
    program.parse(process.argv);
}

main();
