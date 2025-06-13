#!/usr/bin/env node

import { Command } from "commander";
import { ShoveCommand } from "./commands/shove";

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    // Top-level "code" group command for commands related to coding
    const code = program.command("code").description("Code related utilities");

    // Register subcommands under "code"
    new ShoveCommand().register(code);

    program.parse();
}

main();
