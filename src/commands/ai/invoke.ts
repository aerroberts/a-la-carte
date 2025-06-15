import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import type { Command } from "commander";
import OpenAI from "openai";
import type { CommandRegistration } from "../../types";
import { Config } from "../../utils/state";

export class AiInvokeCommand implements CommandRegistration {
    name = "invoke";
    description = "Invoke the default AI provider with the contents of a file";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<path>", "File path containing the prompt")
            .action(async (path) => {
                await this.invoke(path);
            });
    }

    private async invoke(path: string): Promise<void> {
        const provider = Config.loadKey<string>("default-provider", "openai");
        const content = readFileSync(path, "utf-8");
        if (provider === "openai") {
            const key = Config.loadKey<string>("openai-api-key");
            const openai = new OpenAI({ apiKey: key });
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content }],
            });
            const message = completion.choices[0]?.message?.content ?? "";
            console.log(message.trim());
        } else if (provider === "claude") {
            const key = Config.loadKey<string>("claude-api-key");
            const client = new Anthropic({ apiKey: key });
            const message = await client.messages.create({
                max_tokens: 1024,
                messages: [{ role: "user", content }],
                model: "claude-3-5-sonnet-latest",
            });
            const text = Array.isArray(message.content)
                ? message.content.map((c) => (typeof c === "string" ? c : c.text)).join("\n")
                : String(message.content);
            console.log(text.trim());
        } else {
            console.log(chalk.red(`Unknown provider: ${provider}`));
        }
    }
}
