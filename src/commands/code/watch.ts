import chalk from "chalk";
import chokidar from "chokidar";
import { bash } from "../../utils/bash";
import { Log } from "../../utils/logger";

export interface WatchArgs {
    pattern?: string;
    command: string;
}

export async function codeWatchHandler({ pattern, command }: WatchArgs): Promise<void> {
    Log.info("Starting file watcher");
    Log.log(
        `Watching ${chalk.whiteBright(pattern || "**/*")} for changes. Running '${chalk.whiteBright(
            command
        )}' on change with 1s debounce.`
    );

    const watcher = chokidar.watch(pattern || "**/*", { ignoreInitial: true });
    let timer: NodeJS.Timeout | null = null;

    const runCommand = async () => {
        try {
            Log.info(`Running ${chalk.whiteBright(command)} . . .`);
            await bash(command);
            Log.success(command);
        } catch (error) {
            Log.fail(command);
            Log.warning(error instanceof Error ? error.message : String(error));
        }
    };

    watcher.on("change", () => {
        if (timer) {
            Log.log(". . .");
            clearTimeout(timer);
        }
        timer = setTimeout(runCommand, 1000);
    });

    // Keep the process alive by never resolving the promise
    await new Promise(() => {});
}
