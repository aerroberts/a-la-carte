import chalk from "chalk";
import chokidar from "chokidar";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";

export class CodeWatchCommand implements CommandRegistration {
    name = "watch";
    description = "Watches files matching a pattern and runs a command on change";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<pattern>", "Glob pattern of files to watch")
            .argument("<command>", "Command to run on file change")
            .action(async (pattern: string, command: string) => {
                await this.watch(pattern, command);
            });
    }

    private async watch(pattern: string, command: string): Promise<void> {
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
}
