import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import chalk from "chalk";
import { Concurrency } from "../utils/concurrency";
import { Log } from "../utils/logger";
import { Config } from "../utils/state";
import type { ModelProviderOutput } from "./provider";
import { GeminiProvider, OpenAIProvider, OpenRouterProvider } from "./providers";
import { AnthropicProvider } from "./providers/anthropic";

let ConcurrencyLock: Concurrency | undefined;

interface InvokeModelArgs {
    provider?: "anthropic" | "openai" | "gemini" | "openrouter";
    modelId?: string;
    inputFile: string;
    outputFile: string;
}

export async function invokeModel(args: InvokeModelArgs) {
    if (!ConcurrencyLock) {
        ConcurrencyLock = new Concurrency(Config.loadKey<number>("api-concurrency", 1));
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

async function buildCacheKey(args: InvokeModelArgs) {
    const inputFileContent = await readFile(args.inputFile, "utf-8");
    const data = `${args.provider}-${args.modelId}-${inputFileContent}`;
    return crypto.createHash("sha256").update(data).digest("hex");
}

async function invokeModelInternal(args: InvokeModelArgs) {
    // use default provider if not provided
    if (!args.provider) {
        args.provider = Config.loadKey<"anthropic" | "openai" | "gemini" | "openrouter">("default-provider", "openai");
    }

    // Check if the input file has changed, we can avoid a model invocation
    const cacheKey = await buildCacheKey(args);
    const cachedResponse = Config.loadFromCache(cacheKey);
    if (cachedResponse) {
        Log.log(`Using cached response for ${chalk.whiteBright(args.provider)} model`);
        await writeFile(args.outputFile, cachedResponse);
        return;
    }

    // invoke the model
    Log.log(`Invoking ${chalk.whiteBright(args.provider)} model with input file ${chalk.whiteBright(args.inputFile)}`);
    const input = await readFile(args.inputFile, "utf-8");
    let response: ModelProviderOutput | undefined;

    if (args.provider === "anthropic") {
        const anthropicModelId = args.modelId || Config.loadKey<string>("anthropic-model", "claude-sonnet-4-20250514");
        const anthropicAuth = Config.loadKey<string>("anthropic-api-key");
        response = await new AnthropicProvider().invoke({
            inputString: input,
            modelId: anthropicModelId,
            auth: {
                apiKey: anthropicAuth,
            },
        });
    } else if (args.provider === "openai") {
        const openaiModelId = args.modelId || Config.loadKey<string>("openai-model", "gpt-4.1-2025-04-14");
        const openaiAuth = Config.loadKey<string>("openai-api-key");
        response = await new OpenAIProvider().invoke({
            inputString: input,
            modelId: openaiModelId,
            auth: {
                apiKey: openaiAuth,
            },
        });
    } else if (args.provider === "gemini") {
        const geminiModelId = args.modelId || Config.loadKey<string>("gemini-model", "gemini-2.5-flash-preview-05-20");
        const geminiAuth = Config.loadKey<string>("gemini-api-key");
        response = await new GeminiProvider().invoke({
            inputString: input,
            modelId: geminiModelId,
            auth: {
                apiKey: geminiAuth,
            },
        });
    } else if (args.provider === "openrouter") {
        const openrouterModelId = args.modelId || Config.loadKey<string>("openrouter-model", "openai/gpt-4o");
        const openrouterAuth = Config.loadKey<string>("openrouter-api-key");
        response = await new OpenRouterProvider().invoke({
            inputString: input,
            modelId: openrouterModelId,
            auth: {
                apiKey: openrouterAuth,
            },
        });
    }

    if (!response) {
        Log.error(`Failed to invoke ${args.provider} model`);
        return;
    }

    const tokensPerSecond = (response.metadata.outputTokens / response.metadata.timeTaken) * 1000;
    Log.log(
        `${args.provider} model responded with ${response.metadata.outputTokens} tokens (input tokens: ${response.metadata.inputTokens}) in ${response.metadata.timeTaken}ms (${tokensPerSecond.toFixed(2)} tokens/s)`
    );

    Config.saveToCache(cacheKey, response.outputString);
    if (response.outputString) {
        Log.log(`Skipping writing to ${chalk.whiteBright(args.outputFile)} because model output was empty`);
        await writeFile(args.outputFile, response.outputString);
    }
    Log.log(`Output written to ${chalk.whiteBright(args.outputFile)}`);
}
