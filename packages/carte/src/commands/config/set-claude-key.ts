import { Config } from "../../utils/state";

export interface SetClaudeKeyArgs {
    key: string;
}

export async function setClaudeKeyConfigHandler({ key }: SetClaudeKeyArgs): Promise<void> {
    Config.setKey("claude-api-key", key);
}
