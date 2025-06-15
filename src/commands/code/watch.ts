import { watch } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join, } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistration } from "../../types";
import { bash } from "../../utils/bash";

export class CodeWatchCommand implements CommandRegistration {
    name = "watch";
    description = "Watch for file changes and execute commands";

    register(program: Command): void {
        program
            .command(this.name)
            .description(this.description)
            .argument("<pattern>", "File pattern to watch (e.g., '*.ts', '**/*.js')")
            .argument("<command...>", "Command to execute when files change")
            .action(async (pattern: string, commandParts: string[]) => {
                await this.watch(pattern, commandParts.join(" "));
            });
    }

    private async watch(pattern: string, command: string): Promise<void> {
        if (!pattern || !command) {
            console.error(chalk.red("Invalid arguments. Usage: a code watch \"<pattern>\" \"<command>\""));
            process.exit(1);
        }

        console.log(chalk.blue(`Watching for changes in files matching: ${pattern}`));
        console.log(chalk.blue(`Will execute: ${command}`));
        console.log(chalk.gray("Press Ctrl+C to stop watching\n"));

        await this.startWatching(pattern, command);
    }


    private async startWatching(pattern: string, command: string): Promise<void> {
        const debounceMs = 1000;
        let debounceTimer: NodeJS.Timeout | null = null;
        const watchedFiles = new Set<string>();

        // Find initial matching files
        try {
            const files = await this.findMatchingFiles(process.cwd(), pattern);
            for (const file of files) {
                watchedFiles.add(file);
            }
            console.log(chalk.gray(`Found ${files.length} files matching pattern`));
        } catch (error) {
            console.error(chalk.red(`Error finding files with pattern ${pattern}:`, error));
            return;
        }

        // Watch the current directory recursively
        const watcher = watch(process.cwd(), { recursive: true }, (_eventType, filename) => {
            if (!filename) return;

            // Check if the changed file matches our pattern
            const isMatch = this.matchesPattern(filename, pattern);
            if (!isMatch) return;

            // Clear existing debounce timer
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            // Set new debounce timer
            debounceTimer = setTimeout(async () => {
                console.log(chalk.yellow(`File changed: ${filename}`));
                console.log(chalk.blue(`Executing: ${command}`));
                
                try {
                    const output = await bash(command);
                    if (output.trim()) {
                        console.log(output);
                    }
                    console.log(chalk.green("Command completed successfully"));
                } catch (error) {
                    console.error(chalk.red("Command failed:"), error);
                }
                
                console.log(chalk.gray("Watching for changes...\n"));
            }, debounceMs);
        });

        // Handle graceful shutdown
        process.on("SIGINT", () => {
            console.log(chalk.yellow("\nStopping file watcher..."));
            watcher.close();
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            process.exit(0);
        });

        // Keep the process alive
        await new Promise(() => {});
    }

    private async findMatchingFiles(dir: string, pattern: string): Promise<string[]> {
        const matchingFiles: string[] = [];
        
        const scanDirectory = async (currentDir: string): Promise<void> => {
            try {
                const entries = await readdir(currentDir);
                
                for (const entry of entries) {
                    const fullPath = join(currentDir, entry);
                    const relativePath = fullPath.replace(`${dir}/`, "");
                    
                    try {
                        const stats = await stat(fullPath);
                        
                        if (stats.isDirectory()) {
                            // Skip node_modules and hidden directories
                            if (!entry.startsWith(".") && entry !== "node_modules") {
                                await scanDirectory(fullPath);
                            }
                        } else if (stats.isFile() && this.matchesPattern(relativePath, pattern)) {
                            matchingFiles.push(relativePath);
                        }
                    } catch (_error) {
                    }
                }
            } catch (_error) {
                // Skip directories that can't be read
                return;
            }
        };
        
        await scanDirectory(dir);
        return matchingFiles;
    }

    private matchesPattern(filename: string, pattern: string): boolean {
        // Convert glob pattern to regex
        // Handle basic patterns like *.ts, **/*.js, etc.
        const regexPattern = pattern
            .replace(/\./g, "\\.")
            .replace(/\*\*/g, ".*")
            .replace(/\*/g, "[^/]*")
            .replace(/\?/g, ".");

        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(filename);
    }
}