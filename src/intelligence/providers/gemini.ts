import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class GeminiProvider implements ModelProvider {
    name = "gemini";

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const genAI = new GoogleGenerativeAI(input.auth?.apiKey || "");
        const model = genAI.getGenerativeModel({ model: input.modelId });

        const result = await model.generateContent(input.inputString);
        const response = await result.response;

        return {
            metadata: {
                inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString: response.text(),
        };
    }
}
