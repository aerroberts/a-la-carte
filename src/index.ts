#!/usr/bin/env node

import { Command } from "commander";
import { AskClaudeCommand } from "./commands/ai/ask-claude";
import { AskCodexCommand } from "./commands/ai/ask-codex";
import { AiSetOpenAiKeyCommand } from "./commands/ai/set-openai-key";
import { CodeShoveCommand } from "./commands/code/shove";
import { SteeringAddPromptCommand } from "./commands/steering/add-prompt";
import { SteeringListPromptsCommand } from "./commands/steering/list-prompts";
import { SteeringOpenCommand } from "./commands/steering/open";
import { SteeringSetSourceCommand } from "./commands/steering/set-source";
import { SteeringSyncCommand } from "./commands/steering/sync";

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    // Top-level "code" group command for commands related to coding
    const code = program.command("code").description("Coding related utilities");
    const steering = program.command("steering").description("Steering rules and prompts management");
    const ai = program.command("ai").description("AI related utilities");

    // Register subcommands under "code"
    new CodeShoveCommand().register(code);

    new SteeringSyncCommand().register(steering);
    new SteeringSetSourceCommand().register(steering);
    new SteeringAddPromptCommand().register(steering);
    new SteeringListPromptsCommand().register(steering);
    new SteeringOpenCommand().register(steering);

    new AskClaudeCommand().register(ai);
    new AskCodexCommand().register(ai);
    new AiSetOpenAiKeyCommand().register(ai);

    program.parse();
}

main();
