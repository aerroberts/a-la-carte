import chalk from "chalk";
import { Config } from "../../utils/state";

export interface SetSourceArgs {
    url: string;
}

export async function setSource(args: SetSourceArgs): Promise<void> {
    Config.setKey("config-source", args.url);
    console.log(chalk.green(`Configuration source set to: ${chalk.whiteBright(args.url)}`));
}
