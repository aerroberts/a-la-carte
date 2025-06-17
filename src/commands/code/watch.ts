import { exec } from "node:child_process";
import chalk from "chalk";
import chokidar from "chokidar";
import path from "path";
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
    Log.log("Available environment variables: FILE_PATH, FILE_NAME, FILE_DIR, FILE_EXT, FILE_BASE, FILE_BASE_PATH");

    const watcher = chokidar.watch(pattern || "**/*", { ignoreInitial: true });

    const runCommand = async (filePath: string) => {
        try {
            // Extract file information
            const absolutePath = path.resolve(filePath);
            const fileName = path.basename(filePath);
            const fileDir = path.dirname(filePath);
            const fileExt = path.extname(filePath);
            const fileBase = path.basename(filePath, fileExt);
            const fileBasePath = absolutePath.split(".").slice(0, -1).join(".");

            // Set up environment variables
            const env = {
                ...process.env,
                FILE_PATH: filePath, // Relative path: src/file.ts
                FILE_ABSOLUTE_PATH: absolutePath, // Absolute path: /full/path/to/src/file.ts
                FILE_NAME: fileName, // Full filename: file.ts
                FILE_DIR: fileDir, // Directory: src
                FILE_EXT: fileExt, // Extension: .ts
                FILE_BASE: fileBase, // Base name without extension: file
                FILE_BASE_PATH: fileBasePath, // Base path without extension: /full/path/to/src/file
            };

            Log.info(`Running ${chalk.whiteBright(command)} for ${chalk.cyan(filePath)} . . .`);

            await new Promise<void>((resolve, reject) => {
                exec(command, { env }, (error, stdout, stderr) => {
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

                    Log.success(`${command} for ${fileName}`);
                    resolve();
                });
            });
        } catch (error) {
            Log.fail(`${command} for ${path.basename(filePath)}`);
            Log.warning(error instanceof Error ? error.message : String(error));
        }
    };

    watcher.on("change", runCommand);
    watcher.on("add", runCommand);

    // Keep the process alive by never resolving the promise
    await new Promise(() => {});
}
