import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface SetDefaultProviderArgs {
    provider: string;
}

export async function setDefaultProviderConfigHandler({ provider }: SetDefaultProviderArgs): Promise<void> {
    if (provider !== "openai" && provider !== "claude") {
        Log.error("Error: Provider must be either 'openai' or 'claude'");
        return;
    }
    Config.setKey("default-provider", provider);
}
