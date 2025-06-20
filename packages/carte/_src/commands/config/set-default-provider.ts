import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface SetDefaultProviderArgs {
    provider: string;
}

export async function setDefaultProviderConfigHandler({ provider }: SetDefaultProviderArgs): Promise<void> {
    if (provider !== "openai" && provider !== "anthropic" && provider !== "gemini" && provider !== "openrouter") {
        Log.error("Error: Provider must be one of: 'openai', 'anthropic', 'gemini', 'openrouter'");
        return;
    }

    Config.setKey("default-provider", provider);
    Log.log(`Default provider set to: ${provider}`);
}
