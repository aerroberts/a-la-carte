import { readFile, writeFile } from "node:fs/promises";
import chalk from "chalk";
import { Log } from "../utils/logger";
import { Config } from "../utils/state";
import type { ModelProviderOutput } from "./provider";
import { GeminiProvider, OpenAIProvider } from "./providers";
import { AnthropicProvider } from "./providers/anthropic";

export async function invokeModel(provider: "anthropic" | "openai" | "gemini", inputFile: string, outputFile: string) {
    Log.log(`Invoking ${chalk.whiteBright(provider)} model with input file ${chalk.whiteBright(inputFile)}`);
    const input = await readFile(inputFile, "utf-8");
    let response: ModelProviderOutput | undefined;

    if (provider === "anthropic") {
        const anthropicModelId = Config.loadKey<string>("anthropic-model", "claude-sonnet-4-20250514");
        const anthropicAuth = Config.loadKey<string>("anthropic-api-key");
        response = await new AnthropicProvider().invoke({
            inputString: input,
            modelId: anthropicModelId,
            auth: {
                apiKey: anthropicAuth,
            },
        });
    } else if (provider === "openai") {
        const openaiModelId = Config.loadKey<string>("openai-model", "gpt-4.1-2025-04-14");
        const openaiAuth = Config.loadKey<string>("openai-api-key");
        response = await new OpenAIProvider().invoke({
            inputString: input,
            modelId: openaiModelId,
            auth: {
                apiKey: openaiAuth,
            },
        });
    } else if (provider === "gemini") {
        const geminiModelId = Config.loadKey<string>("gemini-model", "gemini-2.5-flash-preview-05-20");
        const geminiAuth = Config.loadKey<string>("gemini-api-key");
        response = await new GeminiProvider().invoke({
            inputString: input,
            modelId: geminiModelId,
            auth: {
                apiKey: geminiAuth,
            },
        });
    }

    if (!response) {
        Log.error(`Failed to invoke ${provider} model`);
        return "";
    }

    const tokensPerSecond = (response.metadata.outputTokens / response.metadata.timeTaken) * 1000;
    Log.log(
        `${provider} model responded with ${response.metadata.outputTokens} tokens in ${response.metadata.timeTaken}ms (${tokensPerSecond.toFixed(2)} tokens/s)`
    );

    // Extract the <generative-solution> tag if it exists
    const generativeSolution = response.outputString.match(/<generative-solution>(.*?)<\/generative-solution>/s);
    if (generativeSolution) {
        response.outputString = generativeSolution[1].trim();
    }

    await writeFile(outputFile, response.outputString);
    Log.log(`Output written to ${chalk.whiteBright(outputFile)}`);
}
