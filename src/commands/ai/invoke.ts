import { readFile, writeFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import { OpenAI } from "openai";
import { Log } from "../../utils/logger";
import { combinePromptsWithMessage, loadPrompts, parseResponse } from "../../utils/prompts";
import { Config } from "../../utils/state";

export interface InvokeArgs {
    inputFilePath: string;
    outputFilePath: string;
    prompts?: string[];
}

export async function invokeAiHandler(args: InvokeArgs): Promise<void> {
    const prompts = loadPrompts(args.prompts || []);
    const defaultProvider = Config.loadKey<string>("default-provider");
    const inputFile = await readFile(args.inputFilePath, "utf-8");
    const finalMessage = combinePromptsWithMessage(prompts, inputFile);
    const finalMessageTmp = Config.writeToTmp(finalMessage, ".md");

    Log.log(`Using ${chalk.whiteBright(defaultProvider)} as default provider`);
    if (prompts.length > 0) {
        Log.log(
            `Using ${chalk.whiteBright(prompts.length)} prompt(s) with your request: ${chalk.whiteBright(args.prompts?.join(", ") || "")}`
        );
    }
    Log.log(`Context being sent to AI: ${finalMessageTmp}`);

    if (defaultProvider === "claude") {
        await invokeClaude(finalMessage, args.outputFilePath);
    } else if (defaultProvider === "openai") {
        await invokeOpenAi(finalMessage, args.outputFilePath);
    }

    // Format the response if it's not already formatted
    const response = await readFile(args.outputFilePath, "utf-8");
    const formattedResponse = parseResponse(response);
    await writeFile(args.outputFilePath, formattedResponse);

    Log.log(`Output written to ${args.outputFilePath}`);
}

async function invokeClaude(prompt: string, outputFilePath: string): Promise<void> {
    const client = new Anthropic({
        apiKey: Config.loadKey<string>("claude-api-key"),
    });

    const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    Log.log(`Claude responsed with ${response.usage?.output_tokens} tokens`);

    if (response.content[0].type === "text") {
        await writeFile(outputFilePath, response.content[0].text);
    } else {
        Log.error("Error: Response content is not text");
    }
}

async function invokeOpenAi(prompt: string, outputFilePath: string): Promise<void> {
    const openai = new OpenAI({
        apiKey: Config.loadKey<string>("openai-api-key"),
    });

    const response = await openai.chat.completions.create({
        model: "gpt-4.1-2025-04-14",
        messages: [{ role: "user", content: prompt }],
    });

    Log.log(`OpenAI responsed with ${response.usage?.completion_tokens} tokens`);

    if (response.choices[0].message.content) {
        await writeFile(outputFilePath, response.choices[0].message.content);
    } else {
        Log.error("Error: Response content is not text");
    }
}
