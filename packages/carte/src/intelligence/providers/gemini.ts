import { FunctionCallingMode, GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ModelProvider, ModelProviderInput, ModelProviderOutput } from "../provider";

export class GeminiProvider implements ModelProvider {
    name = "gemini";

    private convertToolsToGeminiFormat(tools: ModelProviderInput["tools"]) {
        if (!tools || tools.length === 0) return null;

        return {
            functionDeclarations: tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: this.convertParametersToGeminiSchema(tool.parameters),
                    required: Object.keys(tool.parameters),
                },
            })),
        };
    }

    private convertParametersToGeminiSchema(parameters: Record<string, unknown>): Record<string, any> {
        const converted: Record<string, any> = {};

        for (const [key, value] of Object.entries(parameters)) {
            if (typeof value === "object" && value !== null && "type" in value) {
                const param = value as any;
                converted[key] = {
                    type:
                        param.type === "string"
                            ? SchemaType.STRING
                            : param.type === "number"
                              ? SchemaType.NUMBER
                              : param.type === "boolean"
                                ? SchemaType.BOOLEAN
                                : SchemaType.OBJECT,
                    description: param.description,
                };
            } else {
                // Default to string if no type specified
                converted[key] = {
                    type: SchemaType.STRING,
                    description: `Parameter ${key}`,
                };
            }
        }

        return converted;
    }

    async invoke(input: ModelProviderInput): Promise<ModelProviderOutput> {
        const startTime = Date.now();
        const genAI = new GoogleGenerativeAI(input.auth?.apiKey || "");

        const geminiTools = this.convertToolsToGeminiFormat(input.tools);
        const toolNames = input.tools?.map((tool) => tool.name) ?? [];

        const modelOptions: {
            model: string;
            tools?: {
                functionDeclarations: {
                    name: string;
                    description: string;
                    parameters: { type: SchemaType; properties: Record<string, any>; required: string[] };
                }[];
            }[];
            toolConfig?: { functionCallingConfig: { mode: FunctionCallingMode; allowedFunctionNames: string[] } };
        } = {
            model: input.modelId,
        };

        if (geminiTools) {
            modelOptions.tools = [geminiTools];
            modelOptions.toolConfig = {
                functionCallingConfig: {
                    mode: FunctionCallingMode.ANY,
                    allowedFunctionNames: toolNames,
                },
            };
        }

        const model = genAI.getGenerativeModel(modelOptions);
        const result = await model.generateContent(input.inputString);
        const response = await result.response;

        // Extract response - collect all function calls and text content
        let outputString = "";
        const toolOutputs: Array<{ name: string; output: Record<string, unknown> }> = [];

        const functionCalls = response.functionCalls();
        const textContent = response.text();

        if (functionCalls?.length) {
            for (const functionCall of functionCalls) {
                toolOutputs.push({
                    name: functionCall.name,
                    output: functionCall.args as Record<string, unknown>,
                });
            }
        }

        // Determine output string: prefer text content, fallback to tool outputs
        if (textContent?.trim()) {
            outputString = textContent;
        } else if (toolOutputs.length > 0) {
            outputString = toolOutputs.map((tool) => `${tool.name}: ${JSON.stringify(tool.output)}`).join("\n");
        }

        return {
            metadata: {
                inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
                timeTaken: Date.now() - startTime,
            },
            outputString,
            toolOutputs: toolOutputs.length > 0 ? toolOutputs : undefined,
        };
    }
}
