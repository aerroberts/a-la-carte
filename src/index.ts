#!/usr/bin/env node

import { Command } from "commander";
import { Commands } from "./commands/_";

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    // Register all commands
    for (const command of Commands) {
        command.register(program);
    }

    program.parse();
}

main();
