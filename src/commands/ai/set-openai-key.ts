import chalk from "chalk";
import { Config } from "../../utils/state";

export interface SetOpenAiKeyArgs {
    key: string;
}

export async function setOpenAiKey(args: SetOpenAiKeyArgs): Promise<void> {
    Config.setKey("openai-api-key", args.key);
    console.log(chalk.green("OpenAI API key saved successfully!"));
}
