import { exec, spawn } from "node:child_process";
import chalk from "chalk";
import { Log } from "./logger";
import { Config } from "./state";

interface BashOptions {
    dir?: string;
    logOutput?: boolean;
}

export async function bash(command: string, options: BashOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                Log.error(`Error executing command: ${command}`);
                Log.log(`stdout: ${stdout}`);
                Log.log(`stderr: ${stderr}`);
                reject(error);
                return;
            }
            if (options.logOutput) {
                if (stdout || stderr) {
                    Log.log("--------------------------------");
                }
                if (stdout) {
                    Log.log(stdout.replaceAll("\n", "\n    "));
                }
                if (stderr) {
                    Log.log(stderr.replaceAll("\n", "\n    "));
                }
                if (stdout || stderr) {
                    Log.log("--------------------------------");
                }
            }
            resolve(stdout + stderr);
        });
    });
}

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
    const scriptPath = await Config.writeToTmp(lines.join("\n"), ".sh");
    await bash(`chmod +x ${scriptPath}`);
    await bash(`open -a Terminal ${scriptPath}`);
    Log.log(`Running constructed script: ${chalk.whiteBright(scriptPath)}`);
}

interface BashInheritCurrentTerminalOptions {
    command: string;
    parameters: string[];
}

export async function bashInheritCurrentTerminal(options: BashInheritCurrentTerminalOptions): Promise<void> {
    const repoDir = process.cwd();
    const claude = spawn(options.command, options.parameters, {
        env: {
            ...process.env,
        },
        cwd: repoDir,
        stdio: "inherit",
    });

    claude.on("close", (code) => {
        process.exit(code || 0);
    });

    claude.on("error", (error) => {
        Log.error(`Failed to start Claude: ${error.message}`);
        process.exit(1);
    });
}
