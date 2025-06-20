import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import chalk from "chalk";
import { Storage } from "..";
import { Concurrency } from "../utils/concurrency";
import { Log } from "../utils/logger";
import type { ModelProviderOutput, ModelProviderTool } from "./provider";
import { GeminiProvider, OpenAIProvider, OpenRouterProvider } from "./providers";
import { AnthropicProvider } from "./providers/anthropic";
import { writeFileTool } from "./tools/write-file";

let ConcurrencyLock: Concurrency | undefined;

interface InvokeModelArgs {
    provider?: "anthropic" | "openai" | "gemini" | "openrouter";
    modelId?: string;
    inputFile: string;
    tools?: "write-file"[];
}

export async function invokeModel(args: InvokeModelArgs) {
    if (!ConcurrencyLock) {
        ConcurrencyLock = new Concurrency(Storage.loadConfigKey<number>("concurrency", 5));
    }

    return ConcurrencyLock.run(async () => {
        try {
            await invokeModelInternal(args);
        } catch (error) {
            console.warn(error);
            Log.warning(`Error invoking ${args.provider} model, will result in no output: ${error}`);
        }
    });
}

async function invokeModelInternal(args: InvokeModelArgs) {
    // use default provider if not provided
    if (!args.provider) {
        args.provider = Storage.loadConfigKey<"anthropic" | "openai" | "gemini" | "openrouter">("provider");
    }
    if (!args.modelId) {
        args.modelId = Storage.loadConfigKey<string>("modelId");
    }

    // load tools
    const tools: ModelProviderTool[] = [];
    if (args.tools?.includes("write-file")) {
        tools.push(writeFileTool);
    }

    // invoke the model
    Log.log(`Invoking ${chalk.whiteBright(args.provider)} model with input file ${chalk.whiteBright(args.inputFile)}`);
    const input = await readFile(args.inputFile, "utf-8");
    let response: ModelProviderOutput | undefined;

    if (args.provider === "anthropic") {
        const anthropicAuth = Storage.loadConfigKey<string>("anthropic-api-key");
        response = await new AnthropicProvider().invoke({
            inputString: input,
            modelId: args.modelId,
            auth: {
                apiKey: anthropicAuth,
            },
            tools,
        });
    } else if (args.provider === "openai") {
        const openaiAuth = Storage.loadConfigKey<string>("openai-api-key");
        response = await new OpenAIProvider().invoke({
            inputString: input,
            modelId: args.modelId,
            auth: {
                apiKey: openaiAuth,
            },
            tools,
        });
    } else if (args.provider === "gemini") {
        const geminiAuth = Storage.loadConfigKey<string>("gemini-api-key");
        response = await new GeminiProvider().invoke({
            inputString: input,
            modelId: args.modelId,
            auth: {
                apiKey: geminiAuth,
            },
            tools,
        });
    } else if (args.provider === "openrouter") {
        const openrouterAuth = Storage.loadConfigKey<string>("openrouter-api-key");
        response = await new OpenRouterProvider().invoke({
            inputString: input,
            modelId: args.modelId,
            auth: {
                apiKey: openrouterAuth,
            },
            tools,
        });
    }

    if (!response) {
        Log.error(`Failed to invoke ${args.provider} model`);
        return;
    }

    const tokensPerSecond = (response.metadata.outputTokens / response.metadata.timeTaken) * 1000;
    Log.log(
        `${args.provider} model responded with ${response.metadata.outputTokens} tokens in ${response.metadata.timeTaken}ms (${tokensPerSecond.toFixed(2)} tokens/s)`
    );

    // TODO: Handle tool outputs
}
