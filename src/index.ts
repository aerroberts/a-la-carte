#!/usr/bin/env node

import { Command } from "commander";
import { AskClaudeCommand } from "./commands/ai/ask-claude";
import { AskCodexCommand } from "./commands/ai/ask-codex";
import { AiSetOpenAiKeyCommand } from "./commands/ai/set-openai-key";
import { CodeShoveCommand } from "./commands/code/shove";
import { RuleSetSourceCommand } from "./commands/rules/set-src";
import { RuleSyncCommand } from "./commands/rules/sync";

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    // Top-level "code" group command for commands related to coding
    const code = program.command("code").description("Coding related utilities");
    const rules = program.command("rules").description("Natural language rules for AI");
    const ai = program.command("ai").description("AI related utilities");

    // Register subcommands under "code"
    new CodeShoveCommand().register(code);

    new RuleSyncCommand().register(rules);
    new RuleSetSourceCommand().register(rules);

    new AskClaudeCommand().register(ai);
    new AskCodexCommand().register(ai);
    new AiSetOpenAiKeyCommand().register(ai);

    program.parse();
}

main();
