#!/usr/bin/env node

import { Command } from "commander";
import { shoveCodeHandler } from "./commands/code/shove";
import { codeWatchHandler } from "./commands/code/watch";
import { buildContextHandler } from "./commands/context/build";
import { runHandler } from "./commands/run";
import { StorageController } from "./controllers/storage-controller";
import { Log } from "./utils/logger";

export const Storage = new StorageController();

async function wrapCommand(message: string, command: () => Promise<void>): Promise<void> {
    try {
        Log.info(message);
        await command();
        Log.success("Done!");
    } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        Log.error(errorInstance.message);
        Log.log(errorInstance.stack ?? "No stack trace available");
    }
}

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    const code = program.command("code").description("Coding related utilities");
    const config = program.command("config").description("Config rules and prompts management");
    const ai = program.command("ai").description("AI related utilities");
    const context = program.command("context").description("Context generation utilities");

    // Code commands
    code.command("watch")
        .description("Watch for changes and run a command")
        .argument("<pattern>", "Pattern to watch")
        .argument("<command>", "Command to run")
        .action((pattern, command) =>
            wrapCommand("Running file watcher", () => codeWatchHandler({ pattern, command }))
        );

    code.command("shove")
        .description("Force pushes your local changes to the remote repository")
        .argument("[message]", "The message to commit with")
        .action((message?: string) => wrapCommand("Shoving changes", () => shoveCodeHandler({ message })));

    // Context commands
    context
        .command("build")
        .description("Build a context file")
        .argument("<target>", "The target directory to build the context for")
        .argument("<output-file>", "The file to write the context to")
        .action((target, outputFile) =>
            wrapCommand("Building context", () => buildContextHandler({ target, outputFile }))
        );

    // Run command
    program
        .command("run")
        .description("Run a command")
        .argument("<action>", "The action to run")
        .action((action) => wrapCommand("Running action", () => runHandler({ action })));

    program.parse(process.argv);
}

main();
