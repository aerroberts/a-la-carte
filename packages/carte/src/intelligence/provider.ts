export interface ModelProviderInput {
    inputString: string;
    modelId: string;
    tools?: ModelProviderTool[];
    auth?: Record<string, string>;
}

export interface ModelProviderTool {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}

export interface ModelProviderOutput {
    metadata: {
        inputTokens: number;
        outputTokens: number;
        timeTaken: number;
    };
    outputString: string;
    toolOutputs?: Array<{
        name: string;
        output: Record<string, unknown>;
    }>;
}

export interface ModelProvider {
    name: string;
    invoke(input: ModelProviderInput): Promise<ModelProviderOutput>;
}
