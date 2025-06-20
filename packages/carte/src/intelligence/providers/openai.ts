import { OpenAI } from "openai";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class OpenAIProvider implements ModelProvider {
    public name = "openai";

    private convertToolsToOpenAIFormat(tools: ModelProviderInput["tools"]) {
        return (
            tools?.map((tool) => ({
                type: "function" as const,
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: {
                        type: "object",
                        properties: tool.parameters,
                        required: Object.keys(tool.parameters),
                    },
                },
            })) ?? []
        );
    }

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const client = new OpenAI(input.auth);

        const openaiTools = this.convertToolsToOpenAIFormat(input.tools);

        const requestOptions: any = {
            model: input.modelId,
            messages: [
                {
                    role: "user",
                    content: input.inputString,
                },
            ],
        };

        if (openaiTools.length > 0) {
            requestOptions.tools = openaiTools;
        }

        const response = await client.chat.completions.create(requestOptions);

        // Extract response - collect all tool calls and text content
        let outputString = "";
        const toolOutputs: Array<{ name: string; output: Record<string, unknown> }> = [];

        const choice = response.choices[0];
        const toolCalls = choice?.message?.tool_calls;
        const textContent = choice?.message?.content;

        if (toolCalls?.length) {
            for (const toolCall of toolCalls) {
                toolOutputs.push({
                    name: toolCall.function.name,
                    output: JSON.parse(toolCall.function.arguments),
                });
            }
        }

        // Determine output string: prefer text content, fallback to tool outputs
        if (textContent) {
            outputString = textContent;
        } else if (toolOutputs.length > 0) {
            outputString = toolOutputs.map((tool) => `${tool.name}: ${JSON.stringify(tool.output)}`).join("\n");
        }

        return {
            metadata: {
                inputTokens: response.usage?.prompt_tokens ?? 0,
                outputTokens: response.usage?.completion_tokens ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString,
            toolOutputs: toolOutputs.length > 0 ? toolOutputs : undefined,
        };
    }
}
