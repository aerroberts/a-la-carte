import { OpenAI } from "openai";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class OpenAIProvider implements ModelProvider {
    name = "openai";

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const client = new OpenAI(input.auth);

        const response = await client.chat.completions.create({
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
                inputTokens: response.usage?.prompt_tokens ?? 0,
                outputTokens: response.usage?.completion_tokens ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString: response.choices[0]?.message?.content ?? "",
        };
    }
}
