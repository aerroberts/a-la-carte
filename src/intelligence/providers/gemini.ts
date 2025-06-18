import { FunctionCallingMode, GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class GeminiProvider implements ModelProvider {
    name = "gemini";

    private readonly toolConfig = {
        functionDeclarations: [
            {
                name: "provide_solution",
                description: "Provide the solution or response to the user's query as a clean string",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        response: {
                            type: SchemaType.STRING,
                            description: "The complete response to the user's query",
                        },
                    },
                    required: ["response"],
                },
            },
        ],
    };

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const genAI = new GoogleGenerativeAI(input.auth?.apiKey || "");
        const model = genAI.getGenerativeModel({
            model: input.modelId,
            tools: [this.toolConfig],
            toolConfig: {
                functionCallingConfig: {
                    mode: FunctionCallingMode.ANY,
                    allowedFunctionNames: ["provide_solution"],
                },
            },
        });

        const result = await model.generateContent(input.inputString);
        const response = await result.response;

        // Extract the tool result
        let outputString = "";
        const functionCall = response.functionCalls()?.[0];
        if (functionCall?.name === "provide_solution") {
            outputString = (functionCall.args as { response: string })?.response || "";
        }

        return {
            metadata: {
                inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString,
        };
    }
}
