#!/usr/bin/env node

import { Command } from "commander";
import { AskClaudeCommand } from "./commands/ai/ask-claude";
import { AskCodexCommand } from "./commands/ai/ask-codex";
import { AiInvokeCommand } from "./commands/ai/invoke";
import { AiSetClaudeKeyCommand } from "./commands/ai/set-claude-key";
import { AiSetDefaultProviderCommand } from "./commands/ai/set-default-provider";
import { AiSetOpenAiKeyCommand } from "./commands/ai/set-openai-key";
import { CodePopCommand } from "./commands/code/pop";
import { CodeRebasePrsCommand } from "./commands/code/rebase-prs";
import { CodeShoveCommand } from "./commands/code/shove";
import { CodeWatchCommand } from "./commands/code/watch";
import { ConfigAddPromptCommand } from "./commands/config/add-prompt";
import { ConfigListPromptsCommand } from "./commands/config/list-prompts";
import { ConfigOpenCommand } from "./commands/config/open";
import { ConfigSetSourceCommand } from "./commands/config/set-source";
import { ConfigSyncCommand } from "./commands/config/sync";

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    // Top-level "code" group command for commands related to coding
    const code = program.command("code").description("Coding related utilities");
    const config = program.command("config").description("Config rules and prompts management");
    const ai = program.command("ai").description("AI related utilities");

    // Register subcommands under "code"
    new CodeShoveCommand().register(code);
    new CodePopCommand().register(code);
    new CodeRebasePrsCommand().register(code);
    new CodeWatchCommand().register(code);

    new ConfigSyncCommand().register(config);
    new ConfigSetSourceCommand().register(config);
    new ConfigAddPromptCommand().register(config);
    new ConfigListPromptsCommand().register(config);
    new ConfigOpenCommand().register(config);

    new AskClaudeCommand().register(ai);
    new AskCodexCommand().register(ai);
    new AiSetOpenAiKeyCommand().register(ai);
    new AiSetClaudeKeyCommand().register(ai);
    new AiSetDefaultProviderCommand().register(ai);
    new AiInvokeCommand().register(ai);

    program.parse();
}

main();
