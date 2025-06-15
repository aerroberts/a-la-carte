import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import type { Command } from "commander";
import OpenAI from "openai";
import type { CommandRegistration } from "../../types";
import { combinePromptsWithMessage, loadPrompts } from "../../utils/prompts";
import { Config } from "../../utils/state";

export class AiInvokeCommand implements CommandRegistration {
    name = "invoke";
    description = "Invoke the default AI provider with the contents of a file";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .option(
                "-p, --prompt <name>",
                "Load a prompt from the config system (can be used multiple times)",
                this.collectPrompts,
                []
            )
            .argument("<path>", "File path containing the prompt")
            .action(async (path, options) => {
                const output = await this.invoke(path, options.prompt);
                const parsedOutput = await this.parseOutput(output);
                console.log(parsedOutput);
            });
    }

    private collectPrompts(value: string, previous: string[]): string[] {
        return previous.concat([value]);
    }

    private async invoke(path: string, promptNames: string[]): Promise<string> {
        const provider = Config.loadKey<string>("default-provider", "openai");
        const content = readFileSync(path, "utf-8");

        // Load prompts if any were specified
        const prompts = loadPrompts(promptNames);
        const finalMessage = combinePromptsWithMessage(prompts, content);
        if (prompts.length > 0) {
            console.log(chalk.green(`Using ${prompts.length} prompt(s) with your request`));
        }

        if (provider === "openai") {
            const key = Config.loadKey<string>("openai-api-key");
            const openai = new OpenAI({ apiKey: key });
            const completion = await openai.chat.completions.create({
                model: "gpt-4.1-2025-04-14",
                max_tokens: 4096,
                messages: [{ role: "user", content: finalMessage }],
            });
            const message = completion.choices[0]?.message?.content ?? "";
            return message.trim();
        }

        if (provider === "claude") {
            const key = Config.loadKey<string>("claude-api-key");
            const client = new Anthropic({ apiKey: key });
            const message = await client.messages.create({
                max_tokens: 4096,
                messages: [{ role: "user", content: finalMessage }],
                model: "claude-sonnet-4-20250514",
            });
            const text = Array.isArray(message.content)
                ? message.content.map((c) => (typeof c === "string" ? c : c.type === "text" ? c.text : "")).join("\n")
                : String(message.content);
            return text.trim();
        }
        throw new Error(`Unknown provider: ${provider}`);
    }

    private async parseOutput(output: string): Promise<string> {
        const solutionMatch = output.match(/<solution>([\s\S]*?)<\/solution>/);
        if (solutionMatch?.[1]) {
            return solutionMatch[1].trim();
        }
        return output.trim();
    }
}
