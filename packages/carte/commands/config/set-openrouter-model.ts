import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface SetOpenRouterModelArgs {
    model: string;
}

export async function setOpenRouterModelConfigHandler({ model }: SetOpenRouterModelArgs): Promise<void> {
    Config.setKey("openrouter-model", model);
    Log.log(`OpenRouter model set to: ${model}`);
}
