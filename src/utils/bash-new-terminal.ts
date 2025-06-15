import chalk from "chalk";
import { bash } from "./bash";
import { Log } from "./logger";
import { saveToTmp } from "./tmp";

interface BashInNewTerminalOptions {
    command: string;
    dir?: string;
    env?: Record<string, string>;
}

export async function bashInNewTerminal(options: BashInNewTerminalOptions): Promise<void> {
    const lines = [
        "#!/bin/bash",
        "clear",
        `cd "${options.dir}"`,
        ...Object.entries(options.env || {}).map(([key, value]) => `export ${key}="${value}"`),
        options.command,
    ];
    const scriptPath = await saveToTmp({ content: lines.join("\n"), extension: ".sh" });
    await bash(`chmod +x ${scriptPath}`);
    await bash(`open -a Terminal ${scriptPath}`);
    Log.log(`Running constructed script: ${chalk.whiteBright(scriptPath)}`);
}
