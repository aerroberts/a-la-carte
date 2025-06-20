import { Anthropic } from "@anthropic-ai/sdk";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class AnthropicProvider implements ModelProvider {
    name = "anthropic";

    private convertToolsToAnthropicFormat(tools: ModelProviderInput["tools"]) {
        return (
            tools?.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: {
                    type: "object" as const,
                    properties: tool.parameters,
                    required: Object.keys(tool.parameters),
                },
            })) ?? []
        );
    }

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const client = new Anthropic(input.auth);

        const anthropicTools = this.convertToolsToAnthropicFormat(input.tools);

        const requestOptions: any = {
            model: input.modelId,
            max_tokens: 20_000,
            messages: [
                {
                    role: "user",
                    content: input.inputString,
                },
            ],
        };

        if (anthropicTools.length > 0) {
            requestOptions.tools = anthropicTools;
        }

        const response = await client.messages.create(requestOptions);

        // Extract response - collect all tool uses and text content
        let outputString = "";
        const toolOutputs: Array<{ name: string; output: Record<string, unknown> }> = [];
        const textParts: string[] = [];

        for (const content of response.content) {
            if (content.type === "tool_use") {
                toolOutputs.push({
                    name: content.name,
                    output: content.input as Record<string, unknown>,
                });
            }
            if (content.type === "text") {
                textParts.push(content.text);
            }
        }

        // Determine output string: prefer text content, fallback to tool outputs
        if (textParts.length > 0) {
            outputString = textParts.join("\n");
        } else if (toolOutputs.length > 0) {
            outputString = toolOutputs.map((tool) => `${tool.name}: ${JSON.stringify(tool.output)}`).join("\n");
        }

        return {
            metadata: {
                inputTokens: response.usage?.input_tokens ?? 0,
                outputTokens: response.usage?.output_tokens ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString,
            toolOutputs: toolOutputs.length > 0 ? toolOutputs : undefined,
        };
    }
}
