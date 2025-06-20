# Workspace Structure 

Here is the structure of the workspace.

## Workspace File Tree 
This is the file tree of the workspace centered around the root directory: `packages/carte`
```
carte
├── _src
│   ├── commands
│   │   ├── ai
│   │   │   ├── ask-claude.ts
│   │   │   ├── ask-codex.ts
│   │   │   ├── describe-pr.ts
│   │   │   └── invoke.ts
│   │   ├── code
│   │   │   ├── pop.ts
│   │   │   ├── purge.ts
│   │   │   ├── shove.ts
│   │   │   └── watch.ts
│   │   ├── config
│   │   │   ├── list-prompts.ts
│   │   │   ├── set-api-concurrency.ts
│   │   │   ├── set-claude-key.ts
│   │   │   ├── set-default-provider.ts
│   │   │   ├── set-openai-key.ts
│   │   │   ├── set-openrouter-key.ts
│   │   │   ├── set-openrouter-model.ts
│   │   │   ├── show.ts
│   │   │   └── sync-rules.ts
│   │   ├── context
│   │   │   └── generate.ts
│   │   └── run.ts
│   ├── index.ts
│   ├── intelligence
│   │   ├── context
│   │   │   └── file-scaffold.ts
│   │   ├── context.ts
│   │   ├── index.ts
│   │   ├── provider.ts
│   │   └── providers
│   │       ├── anthropic.ts
│   │       ├── gemini.ts
│   │       ├── index.ts
│   │       ├── openai.ts
│   │       └── openrouter.ts
│   └── utils
│       ├── bash.ts
│       ├── clone-repo.ts
│       ├── concurrency.ts
│       ├── diff.ts
│       ├── files.ts
│       ├── find-closest-files.ts
│       ├── load-config.ts
│       ├── logger.ts
│       ├── prompts.ts
│       ├── state.ts
│       └── tree-command.ts
├── dist
│   ├── commands
│   │   ├── code
│   │   │   ├── shove.d.ts
│   │   │   ├── shove.d.ts.map
│   │   │   ├── shove.js
│   │   │   ├── shove.js.map
│   │   │   ├── watch.d.ts
│   │   │   ├── watch.d.ts.map
│   │   │   ├── watch.js
│   │   │   └── watch.js.map
│   │   └── context
│   │       ├── build.d.ts
│   │       ├── build.d.ts.map
│   │       ├── build.js
│   │       └── build.js.map
│   ├── errors.d.ts
│   ├── errors.d.ts.map
│   ├── errors.js
│   ├── errors.js.map
│   ├── index.d.ts
│   ├── index.d.ts.map
│   ├── index.js
│   ├── index.js.map
│   ├── intelligence
│   │   ├── context
│   │   │   ├── context.d.ts
│   │   │   ├── context.d.ts.map
│   │   │   ├── context.js
│   │   │   ├── context.js.map
│   │   │   ├── serialize
│   │   │   │   ├── serialize-file-tree.d.ts
│   │   │   │   ├── serialize-file-tree.d.ts.map
│   │   │   │   ├── serialize-file-tree.js
│   │   │   │   ├── serialize-file-tree.js.map
│   │   │   │   ├── serialize-full-file.d.ts
│   │   │   │   ├── serialize-full-file.d.ts.map
│   │   │   │   ├── serialize-full-file.js
│   │   │   │   ├── serialize-full-file.js.map
│   │   │   │   ├── serialize-nearest-files.d.ts
│   │   │   │   ├── serialize-nearest-files.d.ts.map
│   │   │   │   ├── serialize-nearest-files.js
│   │   │   │   ├── serialize-nearest-files.js.map
│   │   │   │   ├── serialize-nearest-scaffolds.d.ts
│   │   │   │   ├── serialize-nearest-scaffolds.d.ts.map
│   │   │   │   ├── serialize-nearest-scaffolds.js
│   │   │   │   ├── serialize-nearest-scaffolds.js.map
│   │   │   │   ├── serialize-scaffold copy.d.ts
│   │   │   │   ├── serialize-scaffold copy.d.ts.map
│   │   │   │   ├── serialize-scaffold copy.js
│   │   │   │   ├── serialize-scaffold copy.js.map
│   │   │   │   ├── serialize-scaffold-file.d.ts
│   │   │   │   ├── serialize-scaffold-file.d.ts.map
│   │   │   │   ├── serialize-scaffold-file.js
│   │   │   │   ├── serialize-scaffold-file.js.map
│   │   │   │   ├── serialize-scaffold.d.ts
│   │   │   │   ├── serialize-scaffold.d.ts.map
│   │   │   │   ├── serialize-scaffold.js
│   │   │   │   ├── serialize-scaffold.js.map
│   │   │   │   ├── serialize-section.d.ts
│   │   │   │   ├── serialize-section.d.ts.map
│   │   │   │   ├── serialize-section.js
│   │   │   │   ├── serialize-section.js.map
│   │   │   │   └── utils
│   │   │   │       ├── file-scaffold.d.ts
│   │   │   │       ├── file-scaffold.d.ts.map
│   │   │   │       ├── file-scaffold.js
│   │   │   │       ├── file-scaffold.js.map
│   │   │   │       ├── n-nearest-files.d.ts
│   │   │   │       ├── n-nearest-files.d.ts.map
│   │   │   │       ├── n-nearest-files.js
│   │   │   │       └── n-nearest-files.js.map
│   │   │   ├── type.d.ts
│   │   │   ├── type.d.ts.map
│   │   │   ├── type.js
│   │   │   └── type.js.map
│   │   ├── index.d.ts
│   │   ├── index.d.ts.map
│   │   ├── index.js
│   │   └── index.js.map
│   ├── storage
│   │   ├── storage-controller.d.ts
│   │   ├── storage-controller.d.ts.map
│   │   ├── storage-controller.js
│   │   └── storage-controller.js.map
│   └── utils
│       ├── bash
│       │   ├── bash.d.ts
│       │   ├── bash.d.ts.map
│       │   ├── bash.js
│       │   └── bash.js.map
│       ├── diff.d.ts
│       ├── diff.d.ts.map
│       ├── diff.js
│       ├── diff.js.map
│       ├── files.d.ts
│       ├── files.d.ts.map
│       ├── files.js
│       ├── files.js.map
│       ├── logger.d.ts
│       ├── logger.d.ts.map
│       ├── logger.js
│       └── logger.js.map
├── package.json
├── src
│   ├── commands
│   │   ├── code
│   │   │   ├── shove.ts
│   │   │   └── watch.ts
│   │   └── context
│   │       └── build.ts
│   ├── errors.ts
│   ├── index.ts
│   ├── intelligence
│   │   └── context
│   │       ├── context.ts
│   │       ├── serialize
│   │       │   ├── serialize-file-tree.ts
│   │       │   ├── serialize-full-file.ts
│   │       │   ├── serialize-nearest-files.ts
│   │       │   ├── serialize-nearest-scaffolds.ts
│   │       │   ├── serialize-scaffold.ts
│   │       │   ├── serialize-section.ts
│   │       │   └── utils
│   │       │       ├── file-scaffold.ts
│   │       │       └── n-nearest-files.ts
│   │       └── type.ts
│   ├── storage
│   │   └── storage-controller.ts
│   └── utils
│       ├── bash
│       │   └── bash.ts
│       ├── diff.ts
│       ├── files.ts
│       └── logger.ts
└── tsconfig.json
```

# Relevant File Scaffolds 

Here are some file details that are useful to the current task.





## File Scaffold of: packages/carte/_src/commands/run.ts 

This is a scaffold of all the public API of the file. Its not a complete file, but it should give you a good idea of what the file is about. 
```
interface RunArgs {
    action: string;
}

async function actionHandler(args: RunArgs): Promise<void>;
```



## File Scaffold of: packages/carte/_src/intelligence/context.ts 

This is a scaffold of all the public API of the file. Its not a complete file, but it should give you a good idea of what the file is about. 
```
class ModelContext {
  public addContextSection(title: string, key: string, value: string);
  public addPrompts(promptNames: string[]);
  public addPrompt(promptName: string);
  public addUserRequest(userRequest: string);
  public addRequestFromFile(filePath: string);
  public addContextForFile(filePath: string, command: string, context: string);
  public toString();
  public toFile();
}
```

## File Scaffold of: packages/carte/_src/intelligence/index.ts 

This is a scaffold of all the public API of the file. Its not a complete file, but it should give you a good idea of what the file is about. 
```
async function invokeModel(args: InvokeModelArgs);
```

## File Scaffold of: packages/carte/_src/intelligence/provider.ts 

This is a scaffold of all the public API of the file. Its not a complete file, but it should give you a good idea of what the file is about. 
```
interface ModelProviderInput {
    inputString: string;
    modelId: string;
    auth?: Record<string, string>;
}

interface ModelProviderOutput {
    metadata: {
        inputTokens: number;
        outputTokens: number;
        timeTaken: number;
    };
    outputString: string;
}

interface ModelProvider {
    name: string;
    invoke(input: ModelProviderInput): Promise<ModelProviderOutput>;
}
```

## File Scaffold of: packages/carte/_src/utils/bash.ts 

This is a scaffold of all the public API of the file. Its not a complete file, but it should give you a good idea of what the file is about. 
```
async function bash(command: string, options: BashOptions =;

async function bashInNewTerminal(options: BashInNewTerminalOptions): Promise<void>;

async function bashInheritCurrentTerminal(options: BashInheritCurrentTerminalOptions): Promise<void>;
```

## File Scaffold of: packages/carte/src/errors.ts 

This is a scaffold of all the public API of the file. Its not a complete file, but it should give you a good idea of what the file is about. 
```
class CarteError extends Error {
  public constructor(message: string);
}

class ConfigLoadError extends CarteError {
}

class FileNotFoundError extends CarteError {
}
```



## File Content of: packages/carte/package.json 

```
{
  "name": "carte",
  "version": "0.0.1",
  "description": "A hungry developer's toolbox - CLI tool",
  "main": "dist/index.js",
  "bin": {
    "a": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "a code watch \"src/**/*.ts\" \"npm run dev\"",
    "dev": "npm run build && npm link && chmod a+x ./dist/index.js",
    "link": "npm link",
    "unlink": "npm unlink -g carte",
    "test": "vitest run --coverage",
    "test:update": "vitest run --coverage --update",
    "test:view-coverage": "vitest run --coverage; open coverage/index.html"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.54.0",
    "@google/generative-ai": "^0.21.0",
    "chalk": "^4.1.2",
    "chokidar": "^3.5.3",
    "commander": "^14.0.0",
    "diff": "^8.0.2",
    "glob": "^11.0.3",
    "ignore": "^7.0.5",
    "openai": "^5.5.1",
    "tree-node-cli": "^1.6.0",
    "tree-sitter": "^0.21.1",
    "tree-sitter-typescript": "^0.23.2"
  }
} 
```

## File Content of: packages/carte/tsconfig.json 

```
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["es2021"],
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },  
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist"
  ]
} 
```

## File Content of: packages/carte/_src/index.ts 

```
#!/usr/bin/env node

import { Command } from "commander";
import { askClaudeAiHander } from "./commands/ai/ask-claude";
import { askCodexAiHandler } from "./commands/ai/ask-codex";
import { describePrAiHandler } from "./commands/ai/describe-pr";
import { invokeAiHandler } from "./commands/ai/invoke";
import { popCodeHandler } from "./commands/code/pop";
import { purgeCodeHandler } from "./commands/code/purge";
import { shoveCodeHandler } from "./commands/code/shove";
import { codeWatchHandler } from "./commands/code/watch";
import { listPromptsConfigHandler } from "./commands/config/list-prompts";
import { setApiConcurrencyConfigHandler } from "./commands/config/set-api-concurrency";
import { setClaudeKeyConfigHandler } from "./commands/config/set-claude-key";
import { setDefaultProviderConfigHandler } from "./commands/config/set-default-provider";
import { setOpenAiKeyConfigHandler } from "./commands/config/set-openai-key";
import { setOpenRouterKeyConfigHandler } from "./commands/config/set-openrouter-key";
import { setOpenRouterModelConfigHandler } from "./commands/config/set-openrouter-model";
import { showConfigHandler } from "./commands/config/show";
import { syncRulesConfigHandler } from "./commands/config/sync-rules";
import { generateContextHandler } from "./commands/context/generate";
import { actionHandler } from "./commands/run";

function main() {
    const program = new Command();

    program.name("a-la-carte").description("A hungry developer's toolbox").version("0.0.1");

    const code = program.command("code").description("Coding related utilities");
    const config = program.command("config").description("Config rules and prompts management");
    const ai = program.command("ai").description("AI related utilities");
    const context = program.command("context").description("Context generation utilities");

    // Top level commands

    program
        .command("run")
        .description("Run an action defined in the config file")
        .argument("<action>", "The action defined in the config file to perform directly")
        .action((action: string) => actionHandler({ action }));

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
        .command("set-openrouter-key")
        .description("Set your OpenRouter API key")
        .argument("<key>", "Your OpenRouter API key")
        .action((key: string) => setOpenRouterKeyConfigHandler({ key }));

    config
        .command("set-openrouter-model")
        .description("Set your preferred OpenRouter model (e.g., openai/gpt-4o, anthropic/claude-3-opus)")
        .argument("<model>", "The OpenRouter model identifier")
        .action((model: string) => setOpenRouterModelConfigHandler({ model }));

    config
        .command("set-default-provider")
        .description("Set your default AI provider (openai, anthropic, gemini, or openrouter)")
        .argument("<provider>", "The AI provider to set as default (openai, anthropic, gemini, or openrouter)")
        .action((provider: string) => setDefaultProviderConfigHandler({ provider }));

    config
        .command("sync-rules")
        .description("Sync all rules from prompts/rules folder to .cursor/rules in git workspace root")
        .action(() => syncRulesConfigHandler({}));

    config
        .command("set-api-concurrency")
        .description("Set the maximum number of concurrent API requests")
        .argument("<concurrency>", "Maximum number of concurrent API requests (1-100)")
        .action((concurrency: string) => setApiConcurrencyConfigHandler({ concurrency }));

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
        .option("-g, --guidance <guidance>", "Guidance for the AI assistant")
        .argument("<input>", "Path to the input file containing the message")
        .argument("<output>", "Path where the AI response will be written")
        .action((input: string, output: string, options: { prompt: string[] }) =>
            invokeAiHandler({ inputFilePath: input, outputFilePath: output, prompts: options.prompt })
        );

    // context commands
    context
        .command("generate")
        .description("Generate comprehensive context for a file or directory")
        .option(
            "-p, --prompt <name>",
            "Load a prompt from the config system (can be used multiple times)",
            (value: string, previous: string[]) => [...previous, value],
            []
        )
        .option("-g, --guidance <guidance>", "Inline guidance for context generation")
        .option("-f, --full <count>", "Number of files to include with full content (default: 10)", "10")
        .option("-s, --scaffold <count>", "Number of files to include with scaffold content (default: 50)", "50")
        .argument("<input>", "Path to the input file or directory")
        .argument("<output>", "Path where the generated context will be written")
        .action(
            (
                input: string,
                output: string,
                options: { prompt: string[]; guidance?: string; full: string; scaffold: string }
            ) =>
                generateContextHandler({
                    inputPath: input,
                    outputPath: output,
                    prompts: options.prompt,
                    guidance: options.guidance,
                    fullContextCount: Number.parseInt(options.full, 10),
                    scaffoldCount: Number.parseInt(options.scaffold, 10),
                })
        );

    program.parse();
}

main();

```

## File Content of: packages/carte/src/errors.ts 

```
import { Log } from "./utils/logger";

export class CarteError extends Error {
    constructor(message: string) {
        super(message);
        Log.error(`${this.constructor.name}: ${message}`);
    }
}

export class ConfigLoadError extends CarteError {}
export class FileNotFoundError extends CarteError {}

```

## File Content of: packages/carte/src/index.ts 

```
#!/usr/bin/env node

import { Command } from "commander";
import { shoveCodeHandler } from "./commands/code/shove";
import { codeWatchHandler } from "./commands/code/watch";
import { buildContextHandler } from "./commands/context/build";
import { Log } from "./utils/logger";

async function wrapCommand(message: string, command: () => Promise<void>): Promise<void> {
    try {
        Log.info(message);
        await command();
        Log.success("Done!");
    } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        Log.error(errorInstance.message);
        Log.log(errorInstance.stack ?? "No stack trace available");
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

    // Context commands
    context
        .command("build")
        .description("Build a context file")
        .argument("<target>", "The target directory to build the context for")
        .argument("<output-file>", "The file to write the context to")
        .action((target, outputFile) =>
            wrapCommand("Building context", () => buildContextHandler({ target, outputFile }))
        );

    program.parse(process.argv);
}

main();

```