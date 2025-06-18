import { Anthropic } from "@anthropic-ai/sdk";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class AnthropicProvider implements ModelProvider {
    name = "anthropic";

    private readonly toolConfig = {
        name: "provide_solution",
        description: "Provide the solution or response to the user's query as a clean string",
        input_schema: {
            type: "object" as const,
            properties: {
                response: {
                    type: "string" as const,
                    description: "The complete response to the user's query",
                },
            },
            required: ["response"],
        },
    };

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const client = new Anthropic(input.auth);

        const response = await client.messages.create({
            model: input.modelId,
            max_tokens: 2000,
            tools: [this.toolConfig],
            tool_choice: { type: "tool", name: "provide_solution" },
            messages: [
                {
                    role: "user",
                    content: input.inputString,
                },
            ],
        });

        // Extract the tool result
        let outputString = "";
        for (const content of response.content) {
            if (content.type === "tool_use" && content.name === "provide_solution") {
                outputString = (content.input as { response: string }).response;
                break;
            }
        }

        return {
            metadata: {
                inputTokens: response.usage?.input_tokens ?? 0,
                outputTokens: response.usage?.output_tokens ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString,
        };
    }
}
