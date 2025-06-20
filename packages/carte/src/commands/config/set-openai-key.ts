import { Config } from "../../utils/state";

export interface SetOpenAiKeyArgs {
    key: string;
}

export async function setOpenAiKeyConfigHandler({ key }: SetOpenAiKeyArgs): Promise<void> {
    Config.setKey("openai-api-key", key);
}
