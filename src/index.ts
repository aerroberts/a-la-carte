#!/usr/bin/env node

import { Command } from "commander";
import { askClaudeAiHander } from "./commands/ai/ask-claude";
import { askCodexAiHandler } from "./commands/ai/ask-codex";
import { describePrAiHandler } from "./commands/ai/describe-pr";
import { invokeAiHandler } from "./commands/ai/invoke";
import { translateAiHandler } from "./commands/ai/translate";
import { popCodeHandler } from "./commands/code/pop";
import { purgeCodeHandler } from "./commands/code/purge";
import { shoveCodeHandler } from "./commands/code/shove";
import { codeWatchHandler } from "./commands/code/watch";
import { listPromptsConfigHandler } from "./commands/config/list-prompts";
import { setClaudeKeyConfigHandler } from "./commands/config/set-claude-key";
import { setDefaultProviderConfigHandler } from "./commands/config/set-default-provider";
import { setOpenAiKeyConfigHandler } from "./commands/config/set-openai-key";
import { showConfigHandler } from "./commands/config/show";
import { syncRulesConfigHandler } from "./commands/config/sync-rules";

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    const code = program.command("code").description("Coding related utilities");
    const config = program.command("config").description("Config rules and prompts management");
    const ai = program.command("ai").description("AI related utilities");

    // code commands
    code.command("shove")
        .description("Force pushes your local changes to the remote repository")
        .argument("[message]", "The message to commit with")
        .action((message?: string) => shoveCodeHandler({ message }));

    code.command("pop")
        .description("Pop the latest git stash")
        .argument("[message]", "The message to commit with")
        .action((message?: string) => popCodeHandler({ message }));

    code.command("purge")
        .description("Force resets the repo to the current state of remote, destructively removing all local changes")
        .action(() => purgeCodeHandler({}));

    code.command("watch")
        .description("Watches files matching a pattern and runs a command on change")
        .option("-p, --pattern <pattern>", "Glob pattern of files to watch")
        .argument("<command>", "Command to run on file change")
        .action((commandStr: string, options: { pattern: string }) =>
            codeWatchHandler({ pattern: options.pattern, command: commandStr })
        );

    // config commands
    config
        .command("list-prompts")
        .description("List all available prompts")
        .action(() => listPromptsConfigHandler({}));

    config
        .command("show")
        .description("Shows info about the current config")
        .action(() => showConfigHandler({}));

    config
        .command("set-openai-key")
        .description("Set your OpenAI API key")
        .argument("<key>", "Your OpenAI API key")
        .action((key: string) => setOpenAiKeyConfigHandler({ key }));

    config
        .command("set-claude-key")
        .description("Set your Claude API key")
        .argument("<key>", "Your Claude API key")
        .action((key: string) => setClaudeKeyConfigHandler({ key }));

    config
        .command("set-default-provider")
        .description("Set your default AI provider (openai or claude)")
        .argument("<provider>", "The AI provider to set as default (openai or claude)")
        .action((provider: string) => setDefaultProviderConfigHandler({ provider }));

    config
        .command("sync-rules")
        .description("Sync all rules from prompts/rules folder to .cursor/rules in git workspace root")
        .action(() => syncRulesConfigHandler({}));

    // ai commands
    ai.command("describe-pr")
        .description("Ask AI to describe a GitHub PR")
        .argument("<url>", "The URL of the GitHub PR")
        .action((url: string) => describePrAiHandler({ url }));

    ai.command("claude")
        .description(
            "Ask Claude to help with a request. By default, claude will work in the current workspace. Use --delegate to have claude work in a fresh cloned repository."
        )
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .option("-d, --delegate", "Clone the current repository and have claude work in a separate workspace")
        .argument("[message]", "The message to ask claude")
        .action((message: string | undefined, options: { prompt: string[]; delegate?: boolean }) =>
            askClaudeAiHander({
                request: message,
                prompts: options.prompt,
                freshRepo: options.delegate,
            })
        );

    ai.command("codex")
        .description(
            "Ask OpenAI Codex to help with a request. By default, codex will work in the current workspace. Use --delegate to have codex work in a fresh cloned repository."
        )
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .option("-d, --delegate", "Clone the current repository and have codex work in a separate workspace")
        .argument("[message]", "The message to ask codex")
        .action((message: string | undefined, options: { prompt: string[]; delegate?: boolean }) =>
            askCodexAiHandler({
                request: message,
                prompts: options.prompt,
                freshRepo: options.delegate,
            })
        );

    ai.command("invoke")
        .description("Invoke your AI assistant using a custom script")
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .argument("<input>", "Path to the input file containing the message")
        .argument("<output>", "Path where the AI response will be written")
        .action((input: string, output: string, options: { prompt: string[] }) =>
            invokeAiHandler({ inputFilePath: input, outputFilePath: output, prompts: options.prompt })
        );

    ai.command("translate")
        .description("Translate the input file to the output file")
        .argument("<input>", "Path to the input file")
        .argument("<output>", "Path where the translated file will be written")
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .option("-w, --watch", "Watch the input file and automatically translate it to the output file")
        .action((input: string, output: string, options: { prompt: string[]; watch?: boolean }) =>
            translateAiHandler({
                inputFilePath: input,
                outputFilePath: output,
                prompts: options.prompt,
                watch: options.watch,
            })
        );

    program.parse();
}

main();
