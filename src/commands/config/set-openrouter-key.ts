import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface SetOpenRouterKeyArgs {
    key: string;
}

export async function setOpenRouterKeyConfigHandler({ key }: SetOpenRouterKeyArgs): Promise<void> {
    Config.setKey("openrouter-api-key", key);
    Log.log("OpenRouter API key set successfully");
}
