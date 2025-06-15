import chalk from "chalk";
import { Config } from "../../utils/state";

export interface SetDefaultProviderArgs {
    provider: string;
}

export async function setDefaultProvider(args: SetDefaultProviderArgs): Promise<void> {
    const { provider } = args;
    if (provider !== "openai" && provider !== "claude") {
        console.log(chalk.red("Error: Provider must be either 'openai' or 'claude'"));
        return;
    }

    Config.setKey("default-provider", provider);
    console.log(chalk.green(`Default AI provider set to ${provider}!`));
}
