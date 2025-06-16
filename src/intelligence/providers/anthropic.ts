import { Anthropic } from "@anthropic-ai/sdk";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class AnthropicProvider implements ModelProvider {
    name = "anthropic";

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const client = new Anthropic(input.auth);

        const response = await client.messages.create({
            model: input.modelId,
            max_tokens: 2000,
            messages: [
                {
                    role: "user",
                    content: input.inputString,
                },
            ],
        });

        return {
            metadata: {
                inputTokens: response.usage?.input_tokens ?? 0,
                outputTokens: response.usage?.output_tokens ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString: response.content[0].type === "text" ? response.content[0].text : "",
        };
    }
}
