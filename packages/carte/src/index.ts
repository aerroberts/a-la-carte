#!/usr/bin/env node

import { Command } from "commander";
import { shoveCodeHandler } from "./commands/code/shove";
import { codeWatchHandler } from "./commands/code/watch";
import { Log } from "./utils/logger";

async function wrapCommand(message: string, command: () => Promise<void>): Promise<void> {
    try {
        Log.info(message);
        await command();
        Log.success("Done!");
    } catch (error) {
        Log.error(error instanceof Error ? error.message : String(error));
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

    program.parse(process.argv);
}

main();
