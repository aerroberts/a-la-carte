import chalk from "chalk";
import chokidar from "chokidar";
import { glob } from "glob";
import { bash } from "../../utils/bash/bash";
import { Log } from "../../utils/logger";

export interface WatchArgs {
    pattern: string;
    command: string;
}

export async function codeWatchHandler({ pattern, command }: WatchArgs): Promise<void> {
    const matchedFiles = await glob(pattern);
    Log.log(`Found ${matchedFiles.length} files to watch`);

    const runCommand = async (filePath: string) => {
        Log.info(`Running ${chalk.whiteBright(command)} after edit to ${chalk.cyan(filePath)}`);
        try {
            await bash(command, { logOutput: true });
            Log.success("Ran command successfully");
        } catch (error) {
            Log.error(error instanceof Error ? error.message : String(error));
        }
    };

    const watcher = chokidar.watch(pattern, { ignoreInitial: true });
    watcher.on("change", runCommand);
    watcher.on("add", runCommand);
    Log.log(`Watching ${chalk.whiteBright(pattern)} for changes. Running ${chalk.whiteBright(command)} on change.`);

    // Keep the process alive by never resolving the promise
    await new Promise(() => {});
}
