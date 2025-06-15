#!/usr/bin/env node

import { Command } from "commander";
import { askClaude, AskClaudeArgs } from "./commands/ai/ask-claude";
import { askCodex, AskCodexArgs } from "./commands/ai/ask-codex";
import { invokeAi, InvokeArgs } from "./commands/ai/invoke";
import { setClaudeKey, SetClaudeKeyArgs } from "./commands/ai/set-claude-key";
import { setDefaultProvider, SetDefaultProviderArgs } from "./commands/ai/set-default-provider";
import { setOpenAiKey, SetOpenAiKeyArgs } from "./commands/ai/set-openai-key";
import { popStash, PopArgs } from "./commands/code/pop";
import { populateDescriptionAction, PopulateDescriptionArgs } from "./commands/code/populate-description";
import { rebasePullRequests, RebasePrsArgs } from "./commands/code/rebase-prs";
import { shoveChanges, ShoveArgs } from "./commands/code/shove";
import { watchFiles, WatchArgs } from "./commands/code/watch";
import { addPromptCommand, AddPromptArgs } from "./commands/config/add-prompt";
import { listPromptsCommand, ListPromptsArgs } from "./commands/config/list-prompts";
import { openConfigCommand, OpenConfigArgs } from "./commands/config/open";
import { setSource, SetSourceArgs } from "./commands/config/set-source";
import { syncConfig, SyncArgs } from "./commands/config/sync";

function collectPrompts(value: string, previous: string[]): string[] {
    return previous.concat([value]);
}

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    const code = program.command("code").description("Coding related utilities");
    const config = program.command("config").description("Config rules and prompts management");
    const ai = program.command("ai").description("AI related utilities");

    // code commands
    code.command("shove")
        .description("Force pushes your local changes to the remote repository")
        .argument("<message>", "The message to commit with")
        .action(async (message: string) => {
            const args: ShoveArgs = { message };
            await shoveChanges(args);
        });

    code.command("pop")
        .description("Pop the latest git stash")
        .action(async () => {
            const args: PopArgs = {};
            await popStash(args);
        });

    code.command("populate-description")
        .description("Automatically populate the package.json description field")
        .action(async () => {
            const args: PopulateDescriptionArgs = {};
            await populateDescriptionAction(args);
        });

    code.command("rebase-prs")
        .description("Rebase all open pull requests against the main branch")
        .action(async () => {
            const args: RebasePrsArgs = {};
            await rebasePullRequests(args);
        });

    code.command("watch")
        .description("Watches files matching a pattern and runs a command on change")
        .argument("<pattern>", "Glob pattern of files to watch")
        .argument("<command>", "Command to run on file change")
        .action(async (pattern: string, commandStr: string) => {
            const args: WatchArgs = { pattern, command: commandStr };
            await watchFiles(args);
        });

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
            collectPrompts,
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
            collectPrompts,
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
            collectPrompts,
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
