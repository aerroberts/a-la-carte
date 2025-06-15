#!/usr/bin/env node

import { Command } from "commander";

import { type AskClaudeArgs, askClaude } from "./commands/ai/ask-claude";
import { type AskCodexArgs, askCodex } from "./commands/ai/ask-codex";
import { type InvokeArgs, invokeAi } from "./commands/ai/invoke";
import { type SetClaudeKeyArgs, setClaudeKey } from "./commands/ai/set-claude-key";
import { type SetDefaultProviderArgs, setDefaultProvider } from "./commands/ai/set-default-provider";
import { type SetOpenAiKeyArgs, setOpenAiKey } from "./commands/ai/set-openai-key";
import { popCodeHandler } from "./commands/code/pop";
import { type PopulateDescriptionArgs, populateDescriptionAction } from "./commands/code/populate-description";
import { shoveCodeHandler } from "./commands/code/shove";
import { codeWatchHandler } from "./commands/code/watch";
import { type AddPromptArgs, addPromptCommand } from "./commands/config/add-prompt";
import { type ListPromptsArgs, listPromptsCommand } from "./commands/config/list-prompts";
import { type OpenConfigArgs, openConfigCommand } from "./commands/config/open";
import { type SetSourceArgs, setSource } from "./commands/config/set-source";
import { type SyncArgs, syncConfig } from "./commands/config/sync";

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

    code.command("populate-description")
        .description("Automatically populate the package.json description field")
        .action(async () => {
            const args: PopulateDescriptionArgs = {};
            await populateDescriptionAction(args);
        });

    code.command("watch")
        .description("Watches files matching a pattern and runs a command on change")
        .option("-p, --pattern <pattern>", "Glob pattern of files to watch")
        .argument("<command>", "Command to run on file change")
        .action((commandStr: string, options: { pattern: string }) =>
            codeWatchHandler({ pattern: options.pattern, command: commandStr })
        );

    // config commands
    config
        .command("sync")
        .description("Sync configuration from a remote git repository")
        .action(async () => {
            const args: SyncArgs = {};
            await syncConfig(args);
        });

    config
        .command("set-source")
        .description("Set the source URL for configuration syncing")
        .argument("<url>", "The git repository URL to sync configuration from")
        .action(async (url: string) => {
            const args: SetSourceArgs = { url };
            await setSource(args);
        });

    config
        .command("add-prompt")
        .description("Adds a new prompt with the specified name and content")
        .argument("<name>", "The name of the prompt")
        .argument("<content>", "The content/text of the prompt")
        .action(async (name: string, content: string) => {
            const args: AddPromptArgs = { name, content };
            await addPromptCommand(args);
        });

    config
        .command("list-prompts")
        .description("List all available prompts")
        .action(async () => {
            const args: ListPromptsArgs = {};
            await listPromptsCommand(args);
        });

    config
        .command("open")
        .description("Open the configuration file in your default editor")
        .action(async () => {
            const args: OpenConfigArgs = {};
            await openConfigCommand(args);
        });

    // ai commands
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
        .argument("<message>", "The message to ask claude")
        .action(async (message: string, options: { prompt: string[]; delegate?: boolean }) => {
            const args: AskClaudeArgs = { message, prompt: options.prompt, delegate: options.delegate ?? false };
            await askClaude(args);
        });

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
        .argument("<message>", "The message to ask codex")
        .action(async (message: string, options: { prompt: string[]; delegate?: boolean }) => {
            const args: AskCodexArgs = { message, prompt: options.prompt, delegate: options.delegate ?? false };
            await askCodex(args);
        });

    ai.command("invoke")
        .description("Invoke your AI assistant using a custom script")
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .argument("<message>", "The message to send to your AI assistant")
        .action(async (message: string, options: { prompt: string[] }) => {
            const args: InvokeArgs = { message, prompt: options.prompt };
            await invokeAi(args);
        });

    ai.command("set-openai-key")
        .description("Set your OpenAI API key")
        .argument("<key>", "Your OpenAI API key")
        .action(async (key: string) => {
            const args: SetOpenAiKeyArgs = { key };
            await setOpenAiKey(args);
        });

    ai.command("set-claude-key")
        .description("Set your Claude API key")
        .argument("<key>", "Your Claude API key")
        .action(async (key: string) => {
            const args: SetClaudeKeyArgs = { key };
            await setClaudeKey(args);
        });

    ai.command("set-default-provider")
        .description("Set your default AI provider (openai or claude)")
        .argument("<provider>", "The AI provider to set as default (openai or claude)")
        .action(async (provider: string) => {
            const args: SetDefaultProviderArgs = { provider };
            await setDefaultProvider(args);
        });

    program.parse();
}

main();
