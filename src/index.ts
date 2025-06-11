#!/usr/bin/env node

import { Command } from "commander";
import { ShoveCommand } from "./commands/shove";

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    // Register commands
    new ShoveCommand().register(program);

    program.parse();
}

main();
