import chalk from "chalk";
import { Config } from "../../utils/state";

export interface SetClaudeKeyArgs {
    key: string;
}

export async function setClaudeKey(args: SetClaudeKeyArgs): Promise<void> {
    Config.setKey("claude-api-key", args.key);
    console.log(chalk.green("Claude API key saved successfully!"));
}
