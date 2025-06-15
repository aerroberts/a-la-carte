import chalk from "chalk";
import chokidar from "chokidar";
import { bash } from "../../utils/bash";

export interface WatchArgs {
    pattern: string;
    command: string;
}

async function watch(pattern: string, command: string): Promise<void> {
    console.log(
        chalk.green(
            `Watching ${chalk.whiteBright(pattern)} for changes. Running '${chalk.whiteBright(
                command
            )}' on change with 1s debounce.`
        )
    );

    const watcher = chokidar.watch(pattern, { ignoreInitial: true });
    let timer: NodeJS.Timeout | null = null;

    const runCommand = async () => {
        try {
            console.log(chalk.gray(`> ${command}`));
            await bash(command);
            console.log(chalk.green(`Finished: ${chalk.whiteBright(command)}`));
        } catch (error) {
            console.log(chalk.red(`Command failed: ${error}`));
        }
    };

    watcher.on("change", () => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(runCommand, 1000);
    });

    // Keep the process alive by never resolving the promise
    await new Promise(() => {});
}

export async function watchFiles(args: WatchArgs): Promise<void> {
    await watch(args.pattern, args.command);
}
