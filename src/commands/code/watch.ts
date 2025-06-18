import { exec } from "node:child_process";
import chalk from "chalk";
import chokidar from "chokidar";
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
        )}' on change.`
    );

    const watcher = chokidar.watch(pattern || "**/*", { ignoreInitial: true });

    const runCommand = async (filePath: string) => {
        try {
            Log.info(`Running ${chalk.whiteBright(command)} after edit to ${chalk.cyan(filePath)}`);

            await new Promise<void>((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        Log.fail(`${command} (exit code: ${error.code})`);
                        Log.warning(error.message);
                        if (stderr) {
                            Log.log(chalk.red(stderr));
                        }
                        reject(error);
                        return;
                    }

                    if (stdout) {
                        Log.log(stdout.trimEnd());
                    }
                    if (stderr) {
                        Log.log(chalk.yellow(stderr.trimEnd()));
                    }

                    Log.success(`${command} for ${filePath}`);
                    resolve();
                });
            });
        } catch (error) {
            Log.fail(`${command} for ${filePath}`);
            Log.warning(error instanceof Error ? error.message : String(error));
        }
    };

    watcher.on("change", runCommand);
    watcher.on("add", runCommand);

    // Keep the process alive by never resolving the promise
    await new Promise(() => {});
}
