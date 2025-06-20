export interface ModelProviderInput {
    inputString: string;
    modelId: string;
    auth?: Record<string, string>;
}

export interface ModelProviderOutput {
    metadata: {
        inputTokens: number;
        outputTokens: number;
        timeTaken: number;
    };
    outputString: string;
}

export interface ModelProvider {
    name: string;
    invoke(input: ModelProviderInput): Promise<ModelProviderOutput>;
}
