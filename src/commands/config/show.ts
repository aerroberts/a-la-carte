import chalk from "chalk";
import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface ShowConfigArgs {}

export async function showConfigHandler(_: ShowConfigArgs): Promise<void> {
    Log.info("Configuration file details");
    const configPath = Config.getConfigPath();
    Log.log(`Configuration file path: ${chalk.whiteBright(configPath)}`);

    const config = Config.loadFullConfig();
    const configString = JSON.stringify(config, null, 2).replace(/\n/g, "\n      ");
    Log.log(`Configuration Contents: \n      ${chalk.whiteBright(configString)}`);
}
