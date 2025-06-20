import { OpenAI } from "openai";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class OpenRouterProvider implements ModelProvider {
    name = "openrouter";

    private readonly toolConfig = {
        type: "function" as const,
        function: {
            name: "provide_solution",
            description: "Provide the specific requested solution to the user's query as a clean string",
            parameters: {
                type: "object",
                properties: {
                    response: {
                        type: "string",
                        description:
                            "The output string for the specific user request to be programatically consumed. This could be the raw file the user asked you to write if you were asked.",
                    },
                },
                required: ["response"],
            },
        },
    };

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const client = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: input.auth?.apiKey,
            defaultHeaders: {
                "HTTP-Referer": "https://a-la-carte.dev",
                "X-Title": "A La Carte CLI",
            },
        });

        const response = await client.chat.completions.create({
            model: input.modelId,
            tools: [this.toolConfig],
            tool_choice: { type: "function", function: { name: "provide_solution" } },
            messages: [
                {
                    role: "user",
                    content: input.inputString,
                },
            ],
        });

        // Extract the tool result
        let outputString = "";
        const toolCall = response.choices[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.name === "provide_solution") {
            const args = JSON.parse(toolCall.function.arguments);
            outputString = args.response;
        }

        return {
            metadata: {
                inputTokens: response.usage?.prompt_tokens ?? 0,
                outputTokens: response.usage?.completion_tokens ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString,
        };
    }
}
